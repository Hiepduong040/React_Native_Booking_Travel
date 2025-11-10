package com.example.project_react_native_be.service;

import com.example.project_react_native_be.dto.*;
import com.example.project_react_native_be.entity.Hotel;
import com.example.project_react_native_be.entity.Room;
import com.example.project_react_native_be.entity.RoomImage;
import com.example.project_react_native_be.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {
    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public ApiResponse searchRooms(RoomSearchRequest request) {
        try {
            Pageable pageable = PageRequest.of(
                    request.getPage() != null ? request.getPage() : 0,
                    request.getSize() != null ? request.getSize() : 10
            );

            Page<Room> roomPage = roomRepository.searchRooms(
                    request.getKeyword(),
                    request.getCity(),
                    request.getCountry(),
                    request.getHotelId(),
                    pageable
            );

            List<RoomResponse> roomResponses = roomPage.getContent().stream()
                    .map(this::convertToRoomResponse)
                    .collect(Collectors.toList());

            RoomListResponse listResponse = new RoomListResponse(
                    roomResponses,
                    roomPage.getNumber(),
                    roomPage.getTotalPages(),
                    roomPage.getTotalElements(),
                    roomPage.getSize(),
                    roomPage.isFirst(),
                    roomPage.isLast()
            );

            return new ApiResponse("Tìm kiếm phòng thành công", true, listResponse);
        } catch (Exception e) {
            log.error("Error searching rooms", e);
            return new ApiResponse("Lỗi khi tìm kiếm phòng: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse filterAndSortRooms(RoomFilterRequest request) {
        try {
            // Tạo Sort object
            Sort sort = createSort(request.getSortBy(), request.getSortDirection());

            Pageable pageable = PageRequest.of(
                    request.getPage() != null ? request.getPage() : 0,
                    request.getSize() != null ? request.getSize() : 10,
                    sort
            );

            Page<Room> roomPage = roomRepository.filterRooms(
                    request.getHotelId(),
                    request.getCity(),
                    request.getCountry(),
                    request.getRoomType(),
                    request.getMinPrice(),
                    request.getMaxPrice(),
                    request.getMinCapacity(),
                    request.getMaxCapacity(),
                    pageable
            );

            List<RoomResponse> roomResponses = roomPage.getContent().stream()
                    .map(this::convertToRoomResponse)
                    .collect(Collectors.toList());

            RoomListResponse listResponse = new RoomListResponse(
                    roomResponses,
                    roomPage.getNumber(),
                    roomPage.getTotalPages(),
                    roomPage.getTotalElements(),
                    roomPage.getSize(),
                    roomPage.isFirst(),
                    roomPage.isLast()
            );

            return new ApiResponse("Lọc và sắp xếp phòng thành công", true, listResponse);
        } catch (Exception e) {
            log.error("Error filtering rooms", e);
            return new ApiResponse("Lỗi khi lọc phòng: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getRoomDetail(Integer roomId) {
        try {
            Room room = roomRepository.findByIdWithHotelAndImages(roomId)
                    .orElse(null);

            if (room == null) {
                return new ApiResponse("Không tìm thấy phòng với ID: " + roomId, false, null);
            }

            RoomDetailResponse detailResponse = convertToRoomDetailResponse(room);

            return new ApiResponse("Lấy thông tin chi tiết phòng thành công", true, detailResponse);
        } catch (Exception e) {
            log.error("Error getting room detail", e);
            return new ApiResponse("Lỗi khi lấy thông tin phòng: " + e.getMessage(), false, null);
        }
    }

    private RoomResponse convertToRoomResponse(Room room) {
        RoomResponse response = new RoomResponse();
        response.setRoomId(room.getRoomId());
        response.setRoomType(room.getRoomType());
        response.setPrice(room.getPrice());
        response.setCapacity(room.getCapacity());
        response.setDescription(room.getDescription());

        // Convert hotel info
        if (room.getHotel() != null) {
            Hotel hotel = room.getHotel();
            RoomResponse.HotelInfo hotelInfo = new RoomResponse.HotelInfo();
            hotelInfo.setHotelId(hotel.getHotelId());
            hotelInfo.setHotelName(hotel.getHotelName());
            hotelInfo.setAddress(hotel.getAddress());
            hotelInfo.setCity(hotel.getCity());
            hotelInfo.setCountry(hotel.getCountry());
            response.setHotel(hotelInfo);
        }

        // Convert images
        if (room.getImages() != null && !room.getImages().isEmpty()) {
            List<String> imageUrls = room.getImages().stream()
                    .map(RoomImage::getImageUrl)
                    .collect(Collectors.toList());
            response.setImages(imageUrls);

            // Set thumbnail (first image)
            if (!imageUrls.isEmpty()) {
                response.setThumbnailImage(imageUrls.get(0));
            }
        }

        return response;
    }

    private RoomDetailResponse convertToRoomDetailResponse(Room room) {
        RoomDetailResponse response = new RoomDetailResponse();
        response.setRoomId(room.getRoomId());
        response.setRoomType(room.getRoomType());
        response.setPrice(room.getPrice());
        response.setCapacity(room.getCapacity());
        response.setDescription(room.getDescription());

        // Convert hotel detail info
        if (room.getHotel() != null) {
            Hotel hotel = room.getHotel();
            RoomDetailResponse.HotelDetailInfo hotelInfo = new RoomDetailResponse.HotelDetailInfo();
            hotelInfo.setHotelId(hotel.getHotelId());
            hotelInfo.setHotelName(hotel.getHotelName());
            hotelInfo.setAddress(hotel.getAddress());
            hotelInfo.setCity(hotel.getCity());
            hotelInfo.setCountry(hotel.getCountry());
            hotelInfo.setDescription(hotel.getDescription());

            // Convert hotel images
            if (hotel.getImages() != null && !hotel.getImages().isEmpty()) {
                List<String> hotelImageUrls = hotel.getImages().stream()
                        .map(com.example.project_react_native_be.entity.HotelImage::getImageUrl)
                        .collect(Collectors.toList());
                hotelInfo.setImages(hotelImageUrls);
            }

            response.setHotel(hotelInfo);
        }

        // Convert room images
        if (room.getImages() != null && !room.getImages().isEmpty()) {
            List<String> imageUrls = room.getImages().stream()
                    .map(RoomImage::getImageUrl)
                    .collect(Collectors.toList());
            response.setImages(imageUrls);
        }

        return response;
    }

    private Sort createSort(String sortBy, String sortDirection) {
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "price";
        }

        // Validate sort direction
        Sort.Direction direction = Sort.Direction.ASC;
        if (sortDirection != null && sortDirection.equalsIgnoreCase("DESC")) {
            direction = Sort.Direction.DESC;
        }

        // Map sort field
        String fieldName;
        switch (sortBy.toLowerCase()) {
            case "price":
                fieldName = "price";
                break;
            case "capacity":
                fieldName = "capacity";
                break;
            case "createdat":
            case "created_at":
                fieldName = "createdAt";
                break;
            default:
                fieldName = "price";
        }

        return Sort.by(direction, fieldName);
    }
}

