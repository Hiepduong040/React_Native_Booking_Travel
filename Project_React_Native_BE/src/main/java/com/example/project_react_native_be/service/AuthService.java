package com.example.project_react_native_be.service;

import com.example.project_react_native_be.dto.*;
import com.example.project_react_native_be.entity.OtpVerification;
import com.example.project_react_native_be.entity.RefreshToken;
import com.example.project_react_native_be.entity.Role;
import com.example.project_react_native_be.entity.User;
import com.example.project_react_native_be.repository.OtpVerificationRepository;
import com.example.project_react_native_be.repository.RefreshTokenRepository;
import com.example.project_react_native_be.repository.RoleRepository;
import com.example.project_react_native_be.repository.UserRepository;
import com.example.project_react_native_be.config.jwt.JWTProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JWTProvider jwtProvider;

    private static final int OTP_EXPIRATION_MINUTES = 10;
    private static final int REFRESH_TOKEN_EXPIRATION_DAYS = 7;

    @Transactional
    public ApiResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            return new ApiResponse("Email đã được sử dụng", false, null);
        }

        // Tạo mã OTP
        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

        // Lưu OTP vào database
        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(request.getEmail());
        otpVerification.setOtpCode(otpCode);
        otpVerification.setExpiresAt(expiresAt);
        otpVerification.setIsUsed(false);
        otpVerification.setCreatedAt(LocalDateTime.now());
        otpVerificationRepository.save(otpVerification);

        // Tạo user nhưng chưa kích hoạt (is_verified = false)
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(User.Gender.valueOf(request.getGender()));
        user.setIsVerified(false);

        // Gán role mặc định là CUSTOMER nếu chưa có thì tạo
        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName("CUSTOMER");
                    return roleRepository.save(newRole);
                });
        user.setRole(customerRole);

        userRepository.save(user);

        // Gửi email OTP
        emailService.sendOtpEmail(request.getEmail(), otpCode);

        return new ApiResponse("Đăng ký thành công. Vui lòng kiểm tra email để xác minh OTP.", true, null);
    }

    @Transactional
    public ApiResponse verifyOtp(OtpVerificationRequest request) {
        OtpVerification otpVerification = otpVerificationRepository
                .findByEmailAndOtpCodeAndIsUsedFalse(request.getEmail(), request.getOtpCode())
                .orElse(null);

        if (otpVerification == null) {
            return new ApiResponse("Mã OTP không hợp lệ hoặc đã được sử dụng", false, null);
        }

        if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new ApiResponse("Mã OTP đã hết hạn", false, null);
        }

        // Đánh dấu OTP đã sử dụng
        otpVerification.setIsUsed(true);
        otpVerificationRepository.save(otpVerification);

        // Kích hoạt tài khoản
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        user.setIsVerified(true);
        userRepository.save(user);

        // Tạo JWT access token
        String accessToken = jwtProvider.generateToken(user.getEmail());
        
        // Tạo và lưu refresh token
        String refreshTokenValue = createAndSaveRefreshToken(user);

        // Trả về thông tin user
        UserInfo userInfo = new UserInfo(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDateOfBirth(),
                user.getGender() != null ? user.getGender().name() : null,
                user.getAvatarUrl(),
                user.getRole() != null ? user.getRole().getRoleName() : null
        );

        AuthResponse authResponse = new AuthResponse(accessToken, refreshTokenValue, "Xác minh thành công", userInfo);

        return new ApiResponse("Xác minh OTP thành công", true, authResponse);
    }

    public ApiResponse login(LoginRequest request) {
        // Phần đọc: Validate user (read-only để tối ưu)
        User user = validateUserCredentials(request);
        if (user == null) {
            return new ApiResponse("Email hoặc mật khẩu không đúng", false, null);
        }

        if (!user.getIsVerified()) {
            return new ApiResponse("Tài khoản chưa được xác minh. Vui lòng xác minh OTP trước.", false, null);
        }

        // Tạo JWT access token
        String accessToken = jwtProvider.generateToken(user.getEmail());
        
        // Phần ghi: Tạo và lưu refresh token (cần write access)
        String refreshTokenValue = createAndSaveRefreshToken(user);

        // Trả về thông tin user
        UserInfo userInfo = new UserInfo(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDateOfBirth(),
                user.getGender() != null ? user.getGender().name() : null,
                user.getAvatarUrl(),
                user.getRole() != null ? user.getRole().getRoleName() : null
        );

        AuthResponse authResponse = new AuthResponse(accessToken, refreshTokenValue, "Đăng nhập thành công", userInfo);

        return new ApiResponse("Đăng nhập thành công", true, authResponse);
    }

    @Transactional(readOnly = true)
    private User validateUserCredentials(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return null;
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return null;
        }

        return user;
    }

    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        // Kiểm tra email có tồn tại trong hệ thống không
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            // Không tiết lộ email có tồn tại hay không vì lý do bảo mật
            return new ApiResponse("Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra email.", true, null);
        }

        // Kiểm tra tài khoản đã được xác minh chưa
        if (!user.getIsVerified()) {
            return new ApiResponse("Tài khoản chưa được xác minh. Vui lòng xác minh tài khoản trước.", false, null);
        }

        // Tạo mã OTP mới
        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

        // Lưu OTP vào database
        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(request.getEmail());
        otpVerification.setOtpCode(otpCode);
        otpVerification.setExpiresAt(expiresAt);
        otpVerification.setIsUsed(false);
        otpVerification.setCreatedAt(LocalDateTime.now());
        otpVerificationRepository.save(otpVerification);

        // Gửi email OTP
        emailService.sendForgotPasswordOtp(request.getEmail(), otpCode);

        return new ApiResponse("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email.", true, null);
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new ApiResponse("Mật khẩu mới và xác nhận mật khẩu không khớp", false, null);
        }

        // Kiểm tra OTP hợp lệ
        OtpVerification otpVerification = otpVerificationRepository
                .findByEmailAndOtpCodeAndIsUsedFalse(request.getEmail(), request.getOtpCode())
                .orElse(null);

        if (otpVerification == null) {
            return new ApiResponse("Mã OTP không hợp lệ hoặc đã được sử dụng", false, null);
        }

        if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new ApiResponse("Mã OTP đã hết hạn", false, null);
        }

        // Kiểm tra user tồn tại
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new ApiResponse("Người dùng không tồn tại", false, null);
        }

        // Đánh dấu OTP đã sử dụng
        otpVerification.setIsUsed(true);
        otpVerificationRepository.save(otpVerification);

        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new ApiResponse("Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.", true, null);
    }

    @Transactional
    public ApiResponse refreshAccessToken(RefreshTokenRequest request) {
        // Tìm refresh token trong database
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndIsRevokedFalse(request.getRefreshToken())
                .orElse(null);

        if (refreshToken == null) {
            return new ApiResponse("Refresh token không hợp lệ hoặc đã bị thu hồi", false, null);
        }

        // Kiểm tra refresh token chưa hết hạn
        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new ApiResponse("Refresh token đã hết hạn", false, null);
        }

        // Kiểm tra refresh token có phải là JWT hợp lệ không
        if (!jwtProvider.validateRefreshToken(refreshToken.getToken())) {
            return new ApiResponse("Refresh token không hợp lệ", false, null);
        }

        // Lấy user từ refresh token
        User user = refreshToken.getUser();
        if (user == null || !user.getIsVerified()) {
            return new ApiResponse("Tài khoản không hợp lệ hoặc chưa được xác minh", false, null);
        }

        // Tạo access token mới
        String newAccessToken = jwtProvider.generateToken(user.getEmail());

        // Trả về thông tin user
        UserInfo userInfo = new UserInfo(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDateOfBirth(),
                user.getGender() != null ? user.getGender().name() : null,
                user.getAvatarUrl(),
                user.getRole() != null ? user.getRole().getRoleName() : null
        );

        AuthResponse authResponse = new AuthResponse(newAccessToken, refreshToken.getToken(), "Làm mới token thành công", userInfo);

        return new ApiResponse("Làm mới token thành công", true, authResponse);
    }

    @Transactional
    private String createAndSaveRefreshToken(User user) {
        // Xóa các refresh token cũ của user (tùy chọn - có thể giữ nhiều refresh token)
        // refreshTokenRepository.deleteByUser(user);

        // Tạo refresh token mới
        String refreshTokenValue = jwtProvider.generateRefreshToken(user.getEmail());
        
        // Lưu vào database (cần write access)
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRATION_DAYS));
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setIsRevoked(false);
        refreshTokenRepository.save(refreshToken);
        
        return refreshTokenValue;
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6 chữ số
        return String.valueOf(otp);
    }
}

