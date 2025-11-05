package com.example.project_react_native_be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Xác minh OTP - Đăng ký tài khoản");
            message.setText("Mã OTP của bạn là: " + otpCode + "\n\nMã này có hiệu lực trong 10 phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai.");
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending OTP email to: {}", to, e);
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }

    public void sendForgotPasswordOtp(String to, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Mã OTP đặt lại mật khẩu");
            message.setText("Mã OTP để đặt lại mật khẩu của bạn là: " + otpCode + "\n\nMã này có hiệu lực trong 10 phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.");
            mailSender.send(message);
            log.info("Forgot password OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending forgot password OTP email to: {}", to, e);
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }
}

