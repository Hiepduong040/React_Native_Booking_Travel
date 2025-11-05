package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Request DTO for OTP verification")
public class OtpVerificationRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "Email address used for registration", example = "user@example.com", required = true)
    private String email;

    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP code must be 6 digits")
    @Schema(description = "6-digit OTP code sent to email", example = "123456", required = true)
    private String otpCode;
}

