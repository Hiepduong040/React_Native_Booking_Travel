package com.example.project_react_native_be.service;

import com.example.project_react_native_be.dto.*;
import com.example.project_react_native_be.entity.Booking;
import com.example.project_react_native_be.entity.Hotel;
import com.example.project_react_native_be.entity.Room;
import com.example.project_react_native_be.entity.User;
import com.example.project_react_native_be.repository.BookingRepository;
import com.example.project_react_native_be.repository.RoomRepository;
import com.example.project_react_native_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse createBooking(BookingRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Validate dates
            if (request.getCheckIn().isAfter(request.getCheckOut()) || request.getCheckIn().isEqual(request.getCheckOut())) {
                return new ApiResponse("Ngày check-out phải sau ngày check-in", false, null);
            }

            if (request.getCheckIn().isBefore(LocalDate.now())) {
                return new ApiResponse("Ngày check-in không thể là quá khứ", false, null);
            }

            // Get room
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với ID: " + request.getRoomId()));

            // Check if room is available
            List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                    request.getRoomId(),
                    Booking.BookingStatus.CONFIRMED,
                    request.getCheckIn(),
                    request.getCheckOut()
            );

            if (!conflictingBookings.isEmpty()) {
                return new ApiResponse("Phòng đã được đặt trong khoảng thời gian này", false, null);
            }

            // Calculate total price
            long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            BigDecimal totalPrice = room.getPrice().multiply(BigDecimal.valueOf(nights));

            // Create booking
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setRoom(room);
            booking.setCheckIn(request.getCheckIn());
            booking.setCheckOut(request.getCheckOut());
            booking.setTotalPrice(totalPrice);
            booking.setStatus(Booking.BookingStatus.PENDING);
            booking.setAdultsCount(request.getAdultsCount() != null ? request.getAdultsCount() : 1);
            booking.setChildrenCount(request.getChildrenCount() != null ? request.getChildrenCount() : 0);
            booking.setInfantsCount(request.getInfantsCount() != null ? request.getInfantsCount() : 0);

            Booking savedBooking = bookingRepository.save(booking);

            // Convert to response
            BookingResponse response = convertToBookingResponse(savedBooking);

            return new ApiResponse("Tạo booking thành công", true, response);
        } catch (Exception e) {
            log.error("Error creating booking", e);
            return new ApiResponse("Lỗi khi tạo booking: " + e.getMessage(), false, null);
        }
    }

    @Transactional
    public ApiResponse processPayment(PaymentRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Get booking
            Booking booking = bookingRepository.findByIdWithDetails(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với ID: " + request.getBookingId()));

            // Verify booking belongs to user
            if (!booking.getUser().getUserId().equals(user.getUserId())) {
                return new ApiResponse("Bạn không có quyền thanh toán booking này", false, null);
            }

            // Verify booking status
            if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                return new ApiResponse("Booking này đã được thanh toán hoặc đã bị hủy", false, null);
            }

            // Fake payment processing - just validate card format
            if (request.getCardNumber().length() < 13 || request.getCardNumber().length() > 19) {
                return new ApiResponse("Số thẻ không hợp lệ", false, null);
            }

            if (request.getCvv().length() != 3 && request.getCvv().length() != 4) {
                return new ApiResponse("CVV không hợp lệ", false, null);
            }

            // Update booking status to CONFIRMED
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            Booking savedBooking = bookingRepository.save(booking);

            // Convert to response
            BookingResponse response = convertToBookingResponse(savedBooking);

            return new ApiResponse("Thanh toán thành công", true, response);
        } catch (Exception e) {
            log.error("Error processing payment", e);
            return new ApiResponse("Lỗi khi thanh toán: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getUserBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getUserId());
            List<BookingResponse> bookingResponses = bookings.stream()
                    .map(this::convertToBookingResponse)
                    .collect(Collectors.toList());

            return new ApiResponse("Lấy danh sách booking thành công", true, bookingResponses);
        } catch (Exception e) {
            log.error("Error getting user bookings", e);
            return new ApiResponse("Lỗi khi lấy danh sách booking: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getRoomsByBookingStatus(Booking.BookingStatus status) {
        try {
            List<Booking> bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(status);
            
            // Get unique rooms from bookings
            List<Room> rooms = bookings.stream()
                    .map(Booking::getRoom)
                    .distinct()
                    .collect(Collectors.toList());

            // Convert to RoomResponse (simplified - you may need to use RoomService)
            return new ApiResponse("Lấy danh sách phòng theo trạng thái booking thành công", true, rooms);
        } catch (Exception e) {
            log.error("Error getting rooms by booking status", e);
            return new ApiResponse("Lỗi khi lấy danh sách phòng: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getUpcomingBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            LocalDate today = LocalDate.now();
            List<Booking> bookings = bookingRepository.findUpcomingBookingsByUserId(user.getUserId(), today);
            List<BookingResponse> bookingResponses = bookings.stream()
                    .map(this::convertToBookingResponse)
                    .collect(Collectors.toList());

            return new ApiResponse("Lấy danh sách booking sắp tới thành công", true, bookingResponses);
        } catch (Exception e) {
            log.error("Error getting upcoming bookings", e);
            return new ApiResponse("Lỗi khi lấy danh sách booking sắp tới: " + e.getMessage(), false, null);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse getPastBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            LocalDate today = LocalDate.now();
            List<Booking> bookings = bookingRepository.findPastBookingsByUserId(user.getUserId(), today);
            List<BookingResponse> bookingResponses = bookings.stream()
                    .map(this::convertToBookingResponse)
                    .collect(Collectors.toList());

            return new ApiResponse("Lấy danh sách booking đã qua thành công", true, bookingResponses);
        } catch (Exception e) {
            log.error("Error getting past bookings", e);
            return new ApiResponse("Lỗi khi lấy danh sách booking đã qua: " + e.getMessage(), false, null);
        }
    }

    @Transactional
    public ApiResponse cancelBooking(Integer bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ApiResponse("Người dùng chưa đăng nhập", false, null);
            }

            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Get booking
            Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với ID: " + bookingId));

            // Verify booking belongs to user
            if (!booking.getUser().getUserId().equals(user.getUserId())) {
                return new ApiResponse("Bạn không có quyền hủy booking này", false, null);
            }

            // Check if booking can be cancelled (only if check-in hasn't passed)
            LocalDate today = LocalDate.now();
            if (booking.getCheckIn().isBefore(today)) {
                return new ApiResponse("Không thể hủy booking đã bắt đầu", false, null);
            }

            // Check if already cancelled
            if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                return new ApiResponse("Booking này đã được hủy trước đó", false, null);
            }

            // Cancel booking
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            Booking savedBooking = bookingRepository.save(booking);

            // Convert to response
            BookingResponse response = convertToBookingResponse(savedBooking);

            return new ApiResponse("Hủy booking thành công", true, response);
        } catch (Exception e) {
            log.error("Error canceling booking", e);
            return new ApiResponse("Lỗi khi hủy booking: " + e.getMessage(), false, null);
        }
    }

    private BookingResponse convertToBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setCheckIn(booking.getCheckIn());
        response.setCheckOut(booking.getCheckOut());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus().name());
        response.setAdultsCount(booking.getAdultsCount());
        response.setChildrenCount(booking.getChildrenCount());
        response.setInfantsCount(booking.getInfantsCount());
        response.setCreatedAt(booking.getCreatedAt());

        if (booking.getRoom() != null) {
            BookingResponse.RoomInfo roomInfo = new BookingResponse.RoomInfo();
            Room room = booking.getRoom();
            roomInfo.setRoomId(room.getRoomId());
            roomInfo.setRoomType(room.getRoomType());
            roomInfo.setPrice(room.getPrice());
            
            // Get first room image URL
            String roomImageUrl = null;
            if (room.getImages() != null && !room.getImages().isEmpty()) {
                roomImageUrl = room.getImages().get(0).getImageUrl();
                roomInfo.setRoomImageUrl(roomImageUrl);
            }
            
            if (room.getHotel() != null) {
                Hotel hotel = room.getHotel();
                roomInfo.setHotelId(hotel.getHotelId());
                roomInfo.setHotelName(hotel.getHotelName());
                roomInfo.setHotelCity(hotel.getCity());
                roomInfo.setHotelAddress(hotel.getAddress());
            }
            
            response.setRoom(roomInfo);
        }

        return response;
    }
}

