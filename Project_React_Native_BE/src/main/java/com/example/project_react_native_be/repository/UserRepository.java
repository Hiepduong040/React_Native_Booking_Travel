package com.example.project_react_native_be.repository;

import com.example.project_react_native_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.isVerified = false AND u.createdAt < :cutoffTime")
    List<User> findUnverifiedUsersBefore(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM User u WHERE u.isVerified = false AND u.createdAt < :cutoffTime")
    void deleteUnverifiedUsersBefore(@Param("cutoffTime") LocalDateTime cutoffTime);
}

