package com.example.project_react_native_be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Async("emailExecutor")
    public void sendOtpEmail(String to, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("hiepduong0409@gmail.com"); // Set from address
            message.setTo(to);
            message.setSubject("Xác minh OTP - Đăng ký tài khoản");
            message.setText("Mã OTP của bạn là: " + otpCode + "\n\nMã này có hiệu lực trong 10 phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai.");
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending OTP email to: {}, OTP code: {}", to, otpCode, e);
            // Không throw exception để không block request
            // Email có thể được gửi lại sau hoặc user có thể verify bằng OTP từ DB
        }
    }

    @Async("emailExecutor")
    public void sendForgotPasswordOtp(String to, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("hiepduong0409@gmail.com"); // Set from address
            message.setTo(to);
            message.setSubject("Mã OTP đặt lại mật khẩu");
            message.setText("Mã OTP để đặt lại mật khẩu của bạn là: " + otpCode + "\n\nMã này có hiệu lực trong 10 phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.");
            mailSender.send(message);
            log.info("Forgot password OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending forgot password OTP email to: {}, OTP code: {}", to, otpCode, e);
            // Không throw exception để không block request
        }
    }
}

