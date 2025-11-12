package com.example.project_react_native_be.controller;

import com.example.project_react_native_be.dto.ApiResponse;
import com.example.project_react_native_be.dto.ReviewRequest;
import com.example.project_react_native_be.service.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "API endpoints for room/hotel reviews")
public class ReviewController {
    private final ReviewService reviewService;

    @Operation(
            summary = "Thêm đánh giá phòng/khách sạn",
            description = "Thêm đánh giá cho một khách sạn. Người dùng phải đăng nhập và chỉ có thể đánh giá một lần cho mỗi khách sạn."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Thêm đánh giá thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu không hợp lệ hoặc đã đánh giá rồi",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PostMapping
    public ResponseEntity<ApiResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        ApiResponse response = reviewService.createReview(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Lấy danh sách đánh giá theo Room ID",
            description = "Lấy danh sách tất cả đánh giá của một phòng (thông qua hotel của phòng đó)"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách đánh giá thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy phòng",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse> getReviewsByRoomId(@PathVariable Integer roomId) {
        ApiResponse response = reviewService.getReviewsByRoomId(roomId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Chỉnh sửa đánh giá",
            description = "Người dùng đã đăng nhập có thể cập nhật nội dung đánh giá của chính họ"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Cập nhật đánh giá thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Không thể cập nhật đánh giá",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse> updateReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody ReviewRequest request
    ) {
        ApiResponse response = reviewService.updateReview(reviewId, request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Lấy danh sách đánh giá theo Hotel ID",
            description = "Lấy danh sách tất cả đánh giá của một khách sạn"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách đánh giá thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<ApiResponse> getReviewsByHotelId(@PathVariable Integer hotelId) {
        ApiResponse response = reviewService.getReviewsByHotelId(hotelId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/my-review/room/{roomId}")
    public ResponseEntity<ApiResponse> getMyReviewByRoomId(@PathVariable Integer roomId) {
        ApiResponse response = reviewService.getMyReviewByRoomId(roomId);
        HttpStatus status;
        if (response.isSuccess()) {
            status = HttpStatus.OK;
        } else if (response.getData() == null) {
            status = HttpStatus.NOT_FOUND;
        } else {
            status = HttpStatus.BAD_REQUEST;
        }
        return ResponseEntity.status(status).body(response);
    }
}

