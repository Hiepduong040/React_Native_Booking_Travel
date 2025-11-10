package com.example.project_react_native_be.service;

import com.example.project_react_native_be.dto.ApiResponse;
import com.example.project_react_native_be.dto.HotelResponse;
import com.example.project_react_native_be.entity.Hotel;
import com.example.project_react_native_be.entity.HotelImage;
import com.example.project_react_native_be.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelService {
    private final HotelRepository hotelRepository;

    @Transactional(readOnly = true)
    public ApiResponse getAllHotels() {
        try {
            // Use custom query to fetch with images and rooms
            List<Hotel> hotels = hotelRepository.findAllWithImagesAndRooms();
            List<HotelResponse> hotelResponses = hotels.stream()
                    .map(this::convertToHotelResponse)
                    .collect(Collectors.toList());

            return new ApiResponse("Lấy danh sách khách sạn thành công", true, hotelResponses);
        } catch (Exception e) {
            log.error("Error getting all hotels", e);
            return new ApiResponse("Lỗi khi lấy danh sách khách sạn: " + e.getMessage(), false, null);
        }
    }

    private HotelResponse convertToHotelResponse(Hotel hotel) {
        HotelResponse response = new HotelResponse();
        response.setHotelId(hotel.getHotelId());
        response.setHotelName(hotel.getHotelName());
        response.setAddress(hotel.getAddress());
        response.setCity(hotel.getCity());
        response.setCountry(hotel.getCountry());
        response.setDescription(hotel.getDescription());

        // Convert images
        if (hotel.getImages() != null && !hotel.getImages().isEmpty()) {
            List<String> imageUrls = hotel.getImages().stream()
                    .map(HotelImage::getImageUrl)
                    .collect(Collectors.toList());
            response.setImages(imageUrls);

            // Set thumbnail (first image)
            if (!imageUrls.isEmpty()) {
                response.setThumbnailImage(imageUrls.get(0));
            }
        }

        // Set room count
        if (hotel.getRooms() != null) {
            response.setRoomCount(hotel.getRooms().size());
        } else {
            response.setRoomCount(0);
        }

        return response;
    }
}

