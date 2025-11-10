package com.example.project_react_native_be.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for creating a booking")
public class BookingRequest {
    @Schema(description = "Room ID", example = "1", required = true)
    @NotNull(message = "Room ID is required")
    private Integer roomId;

    @Schema(description = "Check-in date", example = "2024-12-25", required = true)
    @NotNull(message = "Check-in date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkIn;

    @Schema(description = "Check-out date", example = "2024-12-27", required = true)
    @NotNull(message = "Check-out date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOut;

    @Schema(description = "Number of adults", example = "2")
    @Min(value = 1, message = "At least 1 adult is required")
    private Integer adultsCount = 1;

    @Schema(description = "Number of children", example = "0")
    @Min(value = 0, message = "Children count cannot be negative")
    private Integer childrenCount = 0;

    @Schema(description = "Number of infants", example = "0")
    @Min(value = 0, message = "Infants count cannot be negative")
    private Integer infantsCount = 0;
}

