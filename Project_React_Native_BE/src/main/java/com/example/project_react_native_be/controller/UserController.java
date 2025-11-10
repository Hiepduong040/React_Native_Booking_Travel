package com.example.project_react_native_be.controller;

import com.example.project_react_native_be.dto.ApiResponse;
import com.example.project_react_native_be.dto.UpdateUserRequest;
import com.example.project_react_native_be.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "API endpoints for user information management")
public class UserController {
    private final UserService userService;

    @Operation(
            summary = "Lấy thông tin tài khoản hiện tại",
            description = "Lấy thông tin của người dùng đang đăng nhập"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy thông tin thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUserInfo() {
        ApiResponse response = userService.getCurrentUserInfo();
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Cập nhật thông tin cá nhân",
            description = "Cập nhật thông tin cá nhân của người dùng đang đăng nhập"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Cập nhật thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PutMapping("/me")
    public ResponseEntity<ApiResponse> updateUserInfo(@Valid @RequestBody UpdateUserRequest request) {
        ApiResponse response = userService.updateUserInfo(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }
}

