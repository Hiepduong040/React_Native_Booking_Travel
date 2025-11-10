package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Request DTO for filtering and sorting rooms")
public class RoomFilterRequest {
    @Schema(description = "Hotel ID", example = "1")
    private Integer hotelId;

    @Schema(description = "City name", example = "Ho Chi Minh")
    private String city;

    @Schema(description = "Country name", example = "Vietnam")
    private String country;

    @Schema(description = "Room type", example = "Deluxe")
    private String roomType;

    @Schema(description = "Minimum price", example = "100000")
    private BigDecimal minPrice;

    @Schema(description = "Maximum price", example = "500000")
    private BigDecimal maxPrice;

    @Schema(description = "Minimum capacity", example = "2")
    private Integer minCapacity;

    @Schema(description = "Maximum capacity", example = "4")
    private Integer maxCapacity;

    @Schema(description = "Sort by field (price, capacity, createdAt)", example = "price")
    private String sortBy = "price";

    @Schema(description = "Sort direction (ASC, DESC)", example = "ASC", allowableValues = {"ASC", "DESC"})
    private String sortDirection = "ASC";

    @Schema(description = "Page number (0-indexed)", example = "0")
    private Integer page = 0;

    @Schema(description = "Page size", example = "10")
    private Integer size = 10;
}

