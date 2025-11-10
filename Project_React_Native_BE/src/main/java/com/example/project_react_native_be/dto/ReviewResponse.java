package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Review information DTO")
public class ReviewResponse {
    @Schema(description = "Review ID", example = "1")
    private Integer reviewId;

    @Schema(description = "Hotel ID", example = "1")
    private Integer hotelId;

    @Schema(description = "Hotel name", example = "Grand Hotel")
    private String hotelName;

    @Schema(description = "User information")
    private UserInfo user;

    @Schema(description = "Rating (1-5)", example = "5")
    private Integer rating;

    @Schema(description = "Review comment")
    private String comment;

    @Schema(description = "Created date")
    private LocalDateTime createdAt;
}

