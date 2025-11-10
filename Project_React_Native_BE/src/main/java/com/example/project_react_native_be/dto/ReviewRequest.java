package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for creating a review")
public class ReviewRequest {
    @Schema(description = "Hotel ID", example = "1", required = true)
    @NotNull(message = "Hotel ID is required")
    private Integer hotelId;

    @Schema(description = "Rating (1-5)", example = "5", required = true)
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Schema(description = "Review comment", example = "Great hotel with excellent service")
    private String comment;
}

