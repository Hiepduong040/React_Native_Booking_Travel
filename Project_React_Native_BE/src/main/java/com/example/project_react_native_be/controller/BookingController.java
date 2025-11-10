package com.example.project_react_native_be.controller;

import com.example.project_react_native_be.dto.ApiResponse;
import com.example.project_react_native_be.dto.BookingRequest;
import com.example.project_react_native_be.dto.PaymentRequest;
import com.example.project_react_native_be.entity.Booking;
import com.example.project_react_native_be.service.BookingService;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "API endpoints for room booking and payment")
public class BookingController {
    private final BookingService bookingService;

    @Operation(
            summary = "Tạo booking mới",
            description = "Tạo booking mới với thông tin phòng, ngày check-in/check-out và số lượng người"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Tạo booking thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu không hợp lệ hoặc phòng đã được đặt",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PostMapping
    public ResponseEntity<ApiResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        // Debug log
        System.out.println("Received booking request - checkIn: " + request.getCheckIn() + ", checkOut: " + request.getCheckOut());
        System.out.println("Current date: " + java.time.LocalDate.now());
        ApiResponse response = bookingService.createBooking(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Thanh toán booking",
            description = "Thanh toán booking bằng thẻ tín dụng (fake payment). Chỉ cần validate format thẻ."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Thanh toán thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Thông tin thẻ không hợp lệ hoặc booking đã được thanh toán",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PostMapping("/payment")
    public ResponseEntity<ApiResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        ApiResponse response = bookingService.processPayment(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Lấy danh sách booking của user hiện tại",
            description = "Lấy danh sách tất cả booking của người dùng đang đăng nhập"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse> getUserBookings() {
        ApiResponse response = bookingService.getUserBookings();
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Lọc phòng theo trạng thái booking",
            description = "Lấy danh sách phòng theo trạng thái booking (PENDING, CONFIRMED, CANCELLED)"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/rooms/by-status")
    public ResponseEntity<ApiResponse> getRoomsByBookingStatus(
            @RequestParam(defaultValue = "CONFIRMED") String status) {
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            ApiResponse response = bookingService.getRoomsByBookingStatus(bookingStatus);
            HttpStatus httpStatus = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
            return ResponseEntity.status(httpStatus).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse("Trạng thái không hợp lệ. Chỉ chấp nhận: PENDING, CONFIRMED, CANCELLED", false, null));
        }
    }
}

