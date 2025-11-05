package com.example.project_react_native_be.service;

import com.example.project_react_native_be.repository.OtpVerificationRepository;
import com.example.project_react_native_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupService {
    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;

    private static final int UNVERIFIED_USER_EXPIRATION_MINUTES = 10;

    /**
     * Chạy mỗi 5 phút để cleanup các user chưa verify và OTP đã hết hạn
     */
    @Scheduled(fixedRate = 300000) // 5 phút = 300000 milliseconds
    @Transactional
    public void cleanupUnverifiedUsersAndExpiredOtps() {
        log.info("Bắt đầu cleanup các user chưa verify và OTP đã hết hạn...");
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(UNVERIFIED_USER_EXPIRATION_MINUTES);
        
        // Tìm các user chưa verify trước cutoffTime
        var unverifiedUsers = userRepository.findUnverifiedUsersBefore(cutoffTime);
        
        if (!unverifiedUsers.isEmpty()) {
            log.info("Tìm thấy {} user chưa verify sau 10 phút, bắt đầu xóa...", unverifiedUsers.size());
            
            // Xóa các user chưa verify
            userRepository.deleteUnverifiedUsersBefore(cutoffTime);
            
            log.info("Đã xóa {} user chưa verify sau 10 phút", unverifiedUsers.size());
        } else {
            log.debug("Không có user chưa verify nào cần xóa");
        }
        
        // Xóa các OTP đã hết hạn
        LocalDateTime now = LocalDateTime.now();
        otpVerificationRepository.deleteExpiredOtps(now);
        
        log.info("Hoàn thành cleanup");
    }
    
    /**
     * Method để cleanup thủ công (có thể gọi từ API nếu cần)
     */
    @Transactional
    public void cleanupNow() {
        cleanupUnverifiedUsersAndExpiredOtps();
    }
}

