package com.example.project_react_native_be.repository;

import com.example.project_react_native_be.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.room r " +
           "LEFT JOIN FETCH r.hotel " +
           "LEFT JOIN FETCH r.images " +
           "WHERE b.user.userId = :userId " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);
    
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.room r " +
           "LEFT JOIN FETCH r.hotel " +
           "LEFT JOIN FETCH r.images " +
           "WHERE b.bookingId = :bookingId")
    Optional<Booking> findByIdWithDetails(@Param("bookingId") Integer bookingId);
    
    @Query("SELECT b FROM Booking b " +
           "WHERE b.room.roomId = :roomId " +
           "AND b.status = :status " +
           "AND ((b.checkIn <= :checkIn AND b.checkOut > :checkIn) OR " +
           "     (b.checkIn < :checkOut AND b.checkOut >= :checkOut) OR " +
           "     (b.checkIn >= :checkIn AND b.checkOut <= :checkOut))")
    List<Booking> findConflictingBookings(
            @Param("roomId") Integer roomId,
            @Param("status") Booking.BookingStatus status,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
    
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.room r " +
           "LEFT JOIN FETCH r.hotel " +
           "WHERE b.status = :status " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByStatusOrderByCreatedAtDesc(@Param("status") Booking.BookingStatus status);
    
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.room r " +
           "LEFT JOIN FETCH r.hotel " +
           "LEFT JOIN FETCH r.images " +
           "WHERE b.user.userId = :userId " +
           "AND b.checkIn >= :today " +
           "AND b.status != 'CANCELLED' " +
           "ORDER BY b.checkIn ASC")
    List<Booking> findUpcomingBookingsByUserId(@Param("userId") Integer userId, @Param("today") LocalDate today);
    
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.room r " +
           "LEFT JOIN FETCH r.hotel " +
           "LEFT JOIN FETCH r.images " +
           "WHERE b.user.userId = :userId " +
           "AND (b.checkOut < :today OR b.status = 'CANCELLED') " +
           "ORDER BY b.checkOut DESC")
    List<Booking> findPastBookingsByUserId(@Param("userId") Integer userId, @Param("today") LocalDate today);
}

