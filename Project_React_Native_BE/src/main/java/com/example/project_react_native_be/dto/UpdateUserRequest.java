package com.example.project_react_native_be.dto;

import com.example.project_react_native_be.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating user information")
public class UpdateUserRequest {
    @Schema(description = "First name", example = "John")
    private String firstName;

    @Schema(description = "Last name", example = "Doe")
    private String lastName;

    @Schema(description = "Phone number", example = "0123456789")
    private String phoneNumber;

    @Schema(description = "Date of birth", example = "1990-01-01")
    private LocalDate dateOfBirth;

    @Schema(description = "Gender", example = "MALE")
    private User.Gender gender;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
    private String avatarUrl;
}

