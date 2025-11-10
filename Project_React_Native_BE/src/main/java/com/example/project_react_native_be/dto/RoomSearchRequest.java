package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Request DTO for searching rooms")
public class RoomSearchRequest {
    @Schema(description = "Search keyword (searches in room type, description, hotel name)", example = "deluxe")
    private String keyword;

    @Schema(description = "City name", example = "Ho Chi Minh")
    private String city;

    @Schema(description = "Country name", example = "Vietnam")
    private String country;

    @Schema(description = "Hotel ID", example = "1")
    private Integer hotelId;

    @Schema(description = "Page number (0-indexed)", example = "0")
    private Integer page = 0;

    @Schema(description = "Page size", example = "10")
    private Integer size = 10;
}

