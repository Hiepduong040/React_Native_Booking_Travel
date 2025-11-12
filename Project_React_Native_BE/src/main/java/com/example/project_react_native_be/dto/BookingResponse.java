package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Booking information DTO")
public class BookingResponse {
    @Schema(description = "Booking ID", example = "1")
    private Integer bookingId;

    @Schema(description = "Room information")
    private RoomInfo room;

    @Schema(description = "Check-in date", example = "2024-12-25")
    private LocalDate checkIn;

    @Schema(description = "Check-out date", example = "2024-12-27")
    private LocalDate checkOut;

    @Schema(description = "Total price", example = "1000000.00")
    private BigDecimal totalPrice;

    @Schema(description = "Booking status", example = "PENDING")
    private String status;

    @Schema(description = "Number of adults", example = "2")
    private Integer adultsCount;

    @Schema(description = "Number of children", example = "0")
    private Integer childrenCount;

    @Schema(description = "Number of infants", example = "0")
    private Integer infantsCount;

    @Schema(description = "Created date")
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Room information in booking")
    public static class RoomInfo {
        @Schema(description = "Room ID", example = "1")
        private Integer roomId;

        @Schema(description = "Room type", example = "Deluxe Room")
        private String roomType;

        @Schema(description = "Price per night", example = "500000.00")
        private BigDecimal price;

        @Schema(description = "Hotel ID", example = "1")
        private Integer hotelId;

        @Schema(description = "Hotel name", example = "Grand Hotel")
        private String hotelName;

        @Schema(description = "Hotel city", example = "Ho Chi Minh")
        private String hotelCity;

        @Schema(description = "Hotel address", example = "123 Main Street")
        private String hotelAddress;

        @Schema(description = "Room image URL (first image)", example = "https://example.com/room1.jpg")
        private String roomImageUrl;
    }
}

