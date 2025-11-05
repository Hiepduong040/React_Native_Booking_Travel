package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request DTO for refreshing access token using refresh token")
public class RefreshTokenRequest {
    @NotBlank(message = "Refresh token is required")
    @Schema(description = "Refresh token to get new access token", example = "eyJhbGciOiJIUzUxMiJ9...", required = true)
    private String refreshToken;
}

