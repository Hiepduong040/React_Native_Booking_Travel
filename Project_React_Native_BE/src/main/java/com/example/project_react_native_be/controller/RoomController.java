package com.example.project_react_native_be.controller;

import com.example.project_react_native_be.dto.*;
import com.example.project_react_native_be.service.RoomService;
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
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Room", description = "API endpoints for room search, filter, and details")
public class RoomController {
    private final RoomService roomService;

    @Operation(
            summary = "Tìm kiếm phòng",
            description = "Tìm kiếm phòng theo keyword, city, country, hoặc hotel ID. Keyword sẽ tìm trong room type, description và hotel name."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Tìm kiếm thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Lỗi khi tìm kiếm",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PostMapping("/search")
    public ResponseEntity<ApiResponse> searchRooms(@Valid @RequestBody RoomSearchRequest request) {
        ApiResponse response = roomService.searchRooms(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Lọc và sắp xếp phòng",
            description = "Lọc phòng theo các tiêu chí: hotelId, city, country, roomType, price range, capacity range. Có thể sắp xếp theo price, capacity, hoặc createdAt."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lọc và sắp xếp thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Lỗi khi lọc",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @PostMapping("/filter")
    public ResponseEntity<ApiResponse> filterAndSortRooms(@Valid @RequestBody RoomFilterRequest request) {
        ApiResponse response = roomService.filterAndSortRooms(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(
            summary = "Lấy thông tin chi tiết phòng",
            description = "Lấy thông tin chi tiết của một phòng bao gồm thông tin hotel và danh sách hình ảnh."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy thông tin thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy phòng",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse> getRoomDetail(@PathVariable Integer roomId) {
        ApiResponse response = roomService.getRoomDetail(roomId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(response);
    }
}

