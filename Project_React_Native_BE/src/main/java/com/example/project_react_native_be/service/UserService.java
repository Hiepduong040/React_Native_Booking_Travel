package com.example.project_react_native_be.service;

import com.example.project_react_native_be.dto.ApiResponse;
import com.example.project_react_native_be.dto.UpdateUserRequest;
import com.example.project_react_native_be.dto.UserInfo;
import com.example.project_react_native_be.entity.User;
import com.example.project_react_native_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ApiResponse getCurrentUserInfo() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            UserInfo userInfo = convertToUserInfo(user);
            return new ApiResponse("Lấy thông tin tài khoản thành công", true, userInfo);
        } catch (Exception e) {
            log.error("Error getting user info", e);
            return new ApiResponse("Lỗi khi lấy thông tin tài khoản: " + e.getMessage(), false, null);
        }
    }

    @Transactional
    public ApiResponse updateUserInfo(UpdateUserRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Update fields if provided
            if (request.getFirstName() != null) {
                user.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null) {
                user.setLastName(request.getLastName());
            }
            if (request.getPhoneNumber() != null) {
                user.setPhoneNumber(request.getPhoneNumber());
            }
            if (request.getDateOfBirth() != null) {
                user.setDateOfBirth(request.getDateOfBirth());
            }
            if (request.getGender() != null) {
                user.setGender(request.getGender());
            }
            if (request.getAvatarUrl() != null) {
                user.setAvatarUrl(request.getAvatarUrl());
            }

            User updatedUser = userRepository.save(user);
            UserInfo userInfo = convertToUserInfo(updatedUser);

            return new ApiResponse("Cập nhật thông tin thành công", true, userInfo);
        } catch (Exception e) {
            log.error("Error updating user info", e);
            return new ApiResponse("Lỗi khi cập nhật thông tin: " + e.getMessage(), false, null);
        }
    }

    private UserInfo convertToUserInfo(User user) {
        UserInfo userInfo = new UserInfo();
        userInfo.setUserId(user.getUserId());
        userInfo.setEmail(user.getEmail());
        userInfo.setFirstName(user.getFirstName());
        userInfo.setLastName(user.getLastName());
        userInfo.setPhoneNumber(user.getPhoneNumber());
        userInfo.setDateOfBirth(user.getDateOfBirth());
        userInfo.setGender(user.getGender() != null ? user.getGender().name() : null);
        userInfo.setAvatarUrl(user.getAvatarUrl());
        return userInfo;
    }
}

