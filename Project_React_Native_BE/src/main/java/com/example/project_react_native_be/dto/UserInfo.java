package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User information DTO")
public class UserInfo {
    @Schema(description = "User ID", example = "1")
    private Integer userId;
    
    @Schema(description = "First name", example = "Nguyen")
    private String firstName;
    
    @Schema(description = "Last name", example = "Van A")
    private String lastName;
    
    @Schema(description = "Email address", example = "user@example.com")
    private String email;
    
    @Schema(description = "Phone number", example = "0123456789")
    private String phoneNumber;
    
    @Schema(description = "Date of birth", example = "1990-01-01")
    private LocalDate dateOfBirth;
    
    @Schema(description = "Gender", example = "MALE", allowableValues = {"MALE", "FEMALE", "OTHER"})
    private String gender;
    
    @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
    private String avatarUrl;
    
    @Schema(description = "User role name", example = "CUSTOMER")
    private String roleName;
}

