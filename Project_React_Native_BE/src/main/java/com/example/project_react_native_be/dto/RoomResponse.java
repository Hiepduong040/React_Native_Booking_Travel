package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Room information DTO for list view")
public class RoomResponse {
    @Schema(description = "Room ID", example = "1")
    private Integer roomId;

    @Schema(description = "Hotel information")
    private HotelInfo hotel;

    @Schema(description = "Room type", example = "Deluxe Room")
    private String roomType;

    @Schema(description = "Price per night", example = "500000.00")
    private BigDecimal price;

    @Schema(description = "Room capacity (number of guests)", example = "2")
    private Integer capacity;

    @Schema(description = "Room description", example = "Spacious room with city view")
    private String description;

    @Schema(description = "List of room image URLs")
    private List<String> images;

    @Schema(description = "First image URL (for thumbnail)", example = "https://example.com/room1.jpg")
    private String thumbnailImage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Hotel information")
    public static class HotelInfo {
        @Schema(description = "Hotel ID", example = "1")
        private Integer hotelId;

        @Schema(description = "Hotel name", example = "Grand Hotel")
        private String hotelName;

        @Schema(description = "Hotel address", example = "123 Main Street")
        private String address;

        @Schema(description = "City", example = "Ho Chi Minh")
        private String city;

        @Schema(description = "Country", example = "Vietnam")
        private String country;
    }
}

