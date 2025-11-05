package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Request DTO for user registration")
public class RegisterRequest {
    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 255, message = "First name must be between 1 and 255 characters")
    @Schema(description = "First name of the user", example = "Nguyen", required = true)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 255, message = "Last name must be between 1 and 255 characters")
    @Schema(description = "Last name of the user", example = "Van A", required = true)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "Email address of the user", example = "user@example.com", required = true)
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10,20}$", message = "Mobile number must be 10-20 digits")
    @Schema(description = "Mobile phone number (10-20 digits)", example = "0123456789", required = true)
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "User password (minimum 6 characters)", example = "password123", required = true)
    private String password;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @Schema(description = "Date of birth", example = "1990-01-01", required = true)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE, or OTHER")
    @Schema(description = "Gender of the user", example = "MALE", allowableValues = {"MALE", "FEMALE", "OTHER"}, required = true)
    private String gender;
}

