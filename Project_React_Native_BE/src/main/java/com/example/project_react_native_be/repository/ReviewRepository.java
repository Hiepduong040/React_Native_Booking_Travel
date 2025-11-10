package com.example.project_react_native_be.repository;

import com.example.project_react_native_be.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    @Query("SELECT r FROM Review r " +
           "LEFT JOIN FETCH r.user " +
           "LEFT JOIN FETCH r.hotel " +
           "WHERE r.hotel.hotelId = :hotelId " +
           "ORDER BY r.createdAt DESC")
    List<Review> findByHotelIdOrderByCreatedAtDesc(@Param("hotelId") Integer hotelId);
    
    @Query("SELECT r FROM Review r " +
           "LEFT JOIN FETCH r.user " +
           "LEFT JOIN FETCH r.hotel " +
           "WHERE r.reviewId = :reviewId")
    Optional<Review> findByIdWithUserAndHotel(@Param("reviewId") Integer reviewId);
    
    @Query("SELECT r FROM Review r " +
           "LEFT JOIN FETCH r.user " +
           "LEFT JOIN FETCH r.hotel " +
           "WHERE r.hotel.hotelId = :hotelId AND r.user.userId = :userId")
    Optional<Review> findByHotelIdAndUserId(@Param("hotelId") Integer hotelId, @Param("userId") Integer userId);
}

