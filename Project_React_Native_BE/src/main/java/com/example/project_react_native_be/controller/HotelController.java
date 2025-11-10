package com.example.project_react_native_be.controller;

import com.example.project_react_native_be.dto.ApiResponse;
import com.example.project_react_native_be.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotel", description = "API endpoints for hotel information")
public class HotelController {
    private final HotelService hotelService;

    @Operation(
            summary = "Lấy danh sách tất cả các khách sạn",
            description = "Lấy danh sách tất cả các khách sạn trong hệ thống bao gồm thông tin cơ bản và hình ảnh."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách thành công",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping
    public ResponseEntity<ApiResponse> getAllHotels() {
        ApiResponse response = hotelService.getAllHotels();
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(response);
    }
}

