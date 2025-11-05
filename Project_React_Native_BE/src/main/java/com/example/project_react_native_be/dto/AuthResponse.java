package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication response containing JWT token, refresh token and user information")
public class AuthResponse {
    @Schema(description = "JWT access token for authentication", example = "eyJhbGciOiJIUzUxMiJ9...")
    private String token;
    
    @Schema(description = "Refresh token for getting new access token", example = "eyJhbGciOiJIUzUxMiJ9...")
    private String refreshToken;
    
    @Schema(description = "Response message", example = "Đăng nhập thành công")
    private String message;
    
    @Schema(description = "User information")
    private UserInfo user;
    
    // Constructor for backward compatibility (chỉ có token)
    public AuthResponse(String token, String message, UserInfo user) {
        this.token = token;
        this.message = message;
        this.user = user;
        this.refreshToken = null;
    }
}

