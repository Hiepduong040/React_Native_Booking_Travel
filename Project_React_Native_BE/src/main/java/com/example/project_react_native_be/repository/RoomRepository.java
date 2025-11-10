package com.example.project_react_native_be.repository;

import com.example.project_react_native_be.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer>, JpaSpecificationExecutor<Room> {
    
    // Tìm kiếm phòng theo keyword (room type, description, hotel name)
    @Query("SELECT r FROM Room r " +
           "LEFT JOIN r.hotel h " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR " +
           "       LOWER(r.roomType) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(h.hotelName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:city IS NULL OR :city = '' OR LOWER(h.city) = LOWER(:city)) " +
           "AND (:country IS NULL OR :country = '' OR LOWER(h.country) = LOWER(:country)) " +
           "AND (:hotelId IS NULL OR h.hotelId = :hotelId)")
    Page<Room> searchRooms(
            @Param("keyword") String keyword,
            @Param("city") String city,
            @Param("country") String country,
            @Param("hotelId") Integer hotelId,
            Pageable pageable
    );

    // Tìm kiếm phòng theo các tiêu chí lọc
    @Query("SELECT r FROM Room r " +
           "LEFT JOIN r.hotel h " +
           "WHERE (:hotelId IS NULL OR h.hotelId = :hotelId) " +
           "AND (:city IS NULL OR :city = '' OR LOWER(h.city) = LOWER(:city)) " +
           "AND (:country IS NULL OR :country = '' OR LOWER(h.country) = LOWER(:country)) " +
           "AND (:roomType IS NULL OR :roomType = '' OR LOWER(r.roomType) LIKE LOWER(CONCAT('%', :roomType, '%'))) " +
           "AND (:minPrice IS NULL OR r.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR r.price <= :maxPrice) " +
           "AND (:minCapacity IS NULL OR r.capacity >= :minCapacity) " +
           "AND (:maxCapacity IS NULL OR r.capacity <= :maxCapacity)")
    Page<Room> filterRooms(
            @Param("hotelId") Integer hotelId,
            @Param("city") String city,
            @Param("country") String country,
            @Param("roomType") String roomType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minCapacity") Integer minCapacity,
            @Param("maxCapacity") Integer maxCapacity,
            Pageable pageable
    );

    // Lấy phòng với hotel và images
    @Query("SELECT r FROM Room r " +
           "LEFT JOIN FETCH r.hotel h " +
           "LEFT JOIN FETCH r.images " +
           "WHERE r.roomId = :roomId")
    Optional<Room> findByIdWithHotelAndImages(@Param("roomId") Integer roomId);
}

