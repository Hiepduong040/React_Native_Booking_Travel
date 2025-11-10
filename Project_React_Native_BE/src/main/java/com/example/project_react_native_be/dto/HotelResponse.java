package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Hotel information DTO")
public class HotelResponse {
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

    @Schema(description = "Hotel description")
    private String description;

    @Schema(description = "List of hotel image URLs")
    private List<String> images;

    @Schema(description = "First image URL (for thumbnail)", example = "https://example.com/hotel1.jpg")
    private String thumbnailImage;

    @Schema(description = "Number of rooms available")
    private Integer roomCount;
}

