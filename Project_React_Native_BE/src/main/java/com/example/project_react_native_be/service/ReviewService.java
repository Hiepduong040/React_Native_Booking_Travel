package com.example.project_react_native_be.service;

import com.example.project_react_native_be.dto.*;
import com.example.project_react_native_be.entity.Hotel;
import com.example.project_react_native_be.entity.Review;
import com.example.project_react_native_be.entity.Room;
import com.example.project_react_native_be.entity.User;
import com.example.project_react_native_be.repository.HotelRepository;
import com.example.project_react_native_be.repository.ReviewRepository;
import com.example.project_react_native_be.repository.RoomRepository;
import com.example.project_react_native_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse createReview(ReviewRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Check if hotel exists
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách sạn với ID: " + request.getHotelId()));

            // Check if user already reviewed this hotel
            Optional<Review> existingReview = reviewRepository.findByHotelIdAndUserId(
                    request.getHotelId(), user.getUserId());
            if (existingReview.isPresent()) {
                return new ApiResponse("Bạn đã đánh giá khách sạn này rồi", false, null);
            }

            // Create new review
            Review review = new Review();
            review.setHotel(hotel);
            review.setUser(user);
            review.setRating(request.getRating());
            review.setComment(request.getComment());

            Review savedReview = reviewRepository.save(review);

            // Convert to response
            ReviewResponse response = convertToReviewResponse(savedReview);

            return new ApiResponse("Thêm đánh giá thành công", true, response);
        } catch (Exception e) {
            log.error("Error creating review", e);
            return new ApiResponse("Lỗi khi thêm đánh giá: " + e.getMessage(), false, null);
        }
    }

    @Transactional
    public ApiResponse updateReview(Integer reviewId, ReviewRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Review review = reviewRepository.findByIdWithUserAndHotel(reviewId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + reviewId));

            if (!review.getUser().getUserId().equals(user.getUserId())) {
                return new ApiResponse("Bạn không có quyền chỉnh sửa đánh giá này", false, null);
            }

            if (request.getHotelId() != null && !review.getHotel().getHotelId().equals(request.getHotelId())) {
                return new ApiResponse("Đánh giá không thuộc về khách sạn được chỉ định", false, null);
            }

            review.setRating(request.getRating());
            review.setComment(request.getComment());

            Review saved = reviewRepository.save(review);
            ReviewResponse response = convertToReviewResponse(saved);
            return new ApiResponse("Cập nhật đánh giá thành công", true, response);
        } catch (Exception e) {
            log.error("Error updating review", e);
            return new ApiResponse("Lỗi khi cập nhật đánh giá: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getReviewsByRoomId(Integer roomId) {
        try {
            // Get room first
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với ID: " + roomId));

            // Get hotel from room
            Hotel hotel = room.getHotel();
            if (hotel == null) {
                return new ApiResponse("Phòng không thuộc khách sạn nào", false, null);
            }

            // Get reviews by hotel
            List<Review> reviews = reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotel.getHotelId());
            List<ReviewResponse> reviewResponses = reviews.stream()
                    .map(this::convertToReviewResponse)
                    .collect(Collectors.toList());

            return new ApiResponse("Lấy danh sách đánh giá thành công", true, reviewResponses);
        } catch (Exception e) {
            log.error("Error getting reviews by room ID", e);
            return new ApiResponse("Lỗi khi lấy danh sách đánh giá: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getReviewsByHotelId(Integer hotelId) {
        try {
            List<Review> reviews = reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
            List<ReviewResponse> reviewResponses = reviews.stream()
                    .map(this::convertToReviewResponse)
                    .collect(Collectors.toList());

            return new ApiResponse("Lấy danh sách đánh giá thành công", true, reviewResponses);
        } catch (Exception e) {
            log.error("Error getting reviews by hotel ID", e);
            return new ApiResponse("Lỗi khi lấy danh sách đánh giá: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getMyReviewByRoomId(Integer roomId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với ID: " + roomId));

            Hotel hotel = room.getHotel();
            if (hotel == null) {
                return new ApiResponse("Phòng không thuộc khách sạn nào", false, null);
            }

            Optional<Review> existingReview = reviewRepository.findByHotelIdAndUserId(hotel.getHotelId(), user.getUserId());
            if (existingReview.isEmpty()) {
                return new ApiResponse("Bạn chưa đánh giá khách sạn này", false, null);
            }

            ReviewResponse response = convertToReviewResponse(existingReview.get());
            return new ApiResponse("Lấy đánh giá thành công", true, response);
        } catch (Exception e) {
            log.error("Error getting my review by room ID", e);
            return new ApiResponse("Lỗi khi lấy đánh giá: " + e.getMessage(), false, null);
        }
    }

    private ReviewResponse convertToReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setReviewId(review.getReviewId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());

        if (review.getHotel() != null) {
            response.setHotelId(review.getHotel().getHotelId());
            response.setHotelName(review.getHotel().getHotelName());
        }

        if (review.getUser() != null) {
            UserInfo userInfo = new UserInfo();
            userInfo.setUserId(review.getUser().getUserId());
            userInfo.setEmail(review.getUser().getEmail());
            userInfo.setFirstName(review.getUser().getFirstName());
            userInfo.setLastName(review.getUser().getLastName());
            userInfo.setAvatarUrl(review.getUser().getAvatarUrl());
            response.setUser(userInfo);
        }

        return response;
    }
}

