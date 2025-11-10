package com.example.project_react_native_be.repository;

import com.example.project_react_native_be.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Integer> {
    
    @Query("SELECT h FROM Hotel h " +
           "LEFT JOIN FETCH h.images " +
           "LEFT JOIN FETCH h.rooms " +
           "WHERE h.hotelId = :hotelId")
    Optional<Hotel> findByIdWithImagesAndRooms(@Param("hotelId") Integer hotelId);
    
    @Query("SELECT DISTINCT h FROM Hotel h " +
           "LEFT JOIN FETCH h.images " +
           "LEFT JOIN FETCH h.rooms")
    java.util.List<Hotel> findAllWithImagesAndRooms();
}

