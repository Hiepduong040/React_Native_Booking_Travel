package com.example.project_react_native_be.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Paginated room list response")
public class RoomListResponse {
    @Schema(description = "List of rooms")
    private List<RoomResponse> rooms;

    @Schema(description = "Current page number (0-indexed)", example = "0")
    private Integer currentPage;

    @Schema(description = "Total number of pages", example = "5")
    private Integer totalPages;

    @Schema(description = "Total number of rooms", example = "50")
    private Long totalElements;

    @Schema(description = "Page size", example = "10")
    private Integer pageSize;

    @Schema(description = "Whether this is the first page", example = "true")
    private Boolean isFirst;

    @Schema(description = "Whether this is the last page", example = "false")
    private Boolean isLast;
}

