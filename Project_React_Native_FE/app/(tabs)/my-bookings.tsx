import { BookingResponse, cancelBooking, getPastBookings, getUpcomingBookings } from '../../apis/bookingApi';
import { BOOKING_COLORS } from '../../constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'upcoming' | 'past';

export default function BookingsScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const { data: upcomingBookings, isLoading: loadingUpcoming, refetch: refetchUpcoming, error: errorUpcoming } = useQuery({
    queryKey: ['upcomingBookings'],
    queryFn: getUpcomingBookings,
    enabled: activeTab === 'upcoming',
    retry: 1,
    onError: (error: any) => {
      console.error('Error fetching upcoming bookings:', error);
      // Don't show alert for empty results, only for actual errors
      if (error.message && !error.message.includes('404') && !error.message.includes('Not Found')) {
        console.error('Error details:', error);
      }
    },
  });

  const { data: pastBookings, isLoading: loadingPast, refetch: refetchPast, error: errorPast } = useQuery({
    queryKey: ['pastBookings'],
    queryFn: getPastBookings,
    enabled: activeTab === 'past',
    retry: 1,
    onError: (error: any) => {
      console.error('Error fetching past bookings:', error);
      // Don't show alert for empty results, only for actual errors
      if (error.message && !error.message.includes('404') && !error.message.includes('Not Found')) {
        console.error('Error details:', error);
      }
    },
  });

  const handleCancelBooking = async (bookingId: number) => {
    Alert.alert(
      'Hủy đặt phòng',
      'Bạn có chắc chắn muốn hủy đặt phòng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt phòng',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              refetchUpcoming();
              queryClient.invalidateQueries({ queryKey: ['upcomingBookings'] });
              Alert.alert('Thành công', 'Đã hủy đặt phòng thành công');
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Không thể hủy đặt phòng');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (booking: BookingResponse) => {
    const roomId = booking.roomId || booking.room?.roomId;
    if (roomId) {
      router.push(`/(tabs)/(products)/${roomId}`);
    }
  };

  const handleWriteReview = (booking: BookingResponse) => {
    const roomId = booking.roomId || booking.room?.roomId;
    if (!roomId) {
      return;
    }

    router.push({
      pathname: '/(tabs)/(products)/[id]',
      params: {
        id: roomId.toString(),
        openReviewModal: 'true',
      },
    });
  };

  const handleBookAgain = (booking: BookingResponse) => {
    const roomId = booking.roomId || booking.room?.roomId;
    if (roomId) {
      router.push(`/(tabs)/(products)/${roomId}`);
    }
  };

  const formatDate = (dateInput: string | number[] | null | undefined): string => {
    if (!dateInput) {
      return 'N/A';
    }

    try {
      let date: Date;

      // Handle array format [year, month, day] from backend
      if (Array.isArray(dateInput)) {
        const [year, month, day] = dateInput;
        if (year && month !== undefined && day !== undefined) {
          date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        } else {
          console.error('Invalid date array:', dateInput);
          return 'N/A';
        }
      } else {
        // Handle string format
        const dateString = String(dateInput);

        if (dateString.includes('T')) {
          // ISO format with time: "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm:ss.SSSZ"
          date = new Date(dateString);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          // Format "YYYY-MM-DD" - parse manually to avoid timezone issues
          const [year, month, day] = dateString.split('-').map(Number);
          date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        } else {
          // Try to parse as-is
          date = new Date(dateString);
        }
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateInput);
        return 'N/A';
      }

      // Format date to readable string
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateInput);
      return 'N/A';
    }
  };

  const parseDate = (value: BookingResponse['checkIn']): Date | null => {
    if (!value) {
      return null;
    }
    if (Array.isArray(value)) {
      const [year, month, day] = value;
      if (!year || month === undefined || day === undefined) {
        return null;
      }
      return new Date(year, month - 1, day);
    }
    const valueString = String(value);
    const parsed = new Date(valueString);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valueString);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return null;
  };

  const isReviewEligible = (booking: BookingResponse): boolean => {
    if (!booking || booking.status === 'CANCELLED') {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = parseDate(booking.checkIn);
    const checkOut = parseDate(booking.checkOut);

    if (!checkIn || !checkOut) {
      return false;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return end < today || (start <= today && end >= today);
  };

  const renderBookingCard = (booking: BookingResponse) => {
    const isUpcoming = activeTab === 'upcoming';
    const roomId = booking.roomId || booking.room?.roomId;
    const hotelName = booking.hotelName || booking.room?.hotelName || 'Hotel';
    const roomType = booking.roomType || booking.room?.roomType || 'Room';
    const location = booking.hotelLocation || booking.hotelAddress || booking.hotelCity || booking.room?.hotelAddress || booking.room?.hotelCity || '';
    const imageUrl = booking.roomImageUrl || booking.room?.roomImageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
    const eligibleForReview = isReviewEligible(booking);
    const hasUserReview = typeof booking.rating === 'number' && booking.rating > 0;

    return (
      <View key={booking.bookingId} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingId}>Booking ID: {booking.bookingId}</Text>
          <Text style={styles.bookingDate}>
            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
          </Text>
        </View>

        <View style={styles.bookingContent}>
          <ExpoImage
            source={{
              uri: imageUrl,
            }}
            style={styles.roomImage}
            contentFit="cover"
          />
          <View style={styles.bookingInfo}>
            {/* Rating - hiển thị kể cả khi bằng 0 */}
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(booking.rating || 0) ? 'star' : 'star-outline'}
                  size={14}
                  color={BOOKING_COLORS.RATING}
                />
              ))}
              <Text style={styles.ratingText}>
                {(booking.rating || 0).toFixed(1)} ({(booking.reviewCount || 0)} {(booking.reviewCount || 0) === 1 ? 'Review' : 'Reviews'})
              </Text>
            </View>

            {/* Room Type */}
            {roomType && (
              <Text style={styles.roomType}>{roomType}</Text>
            )}

            {/* Hotel Name */}
            <Text style={styles.hotelName}>{hotelName}</Text>

            {/* Location */}
            {location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
                <Text style={styles.location}>
                  {location}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bookingActions}>
          {isUpcoming ? (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(booking.bookingId)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewDetails(booking)}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {eligibleForReview && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleWriteReview(booking)}
                >
                  <Text style={styles.cancelButtonText}>
                    {hasUserReview ? 'Edit Review' : 'Write a Review'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleBookAgain(booking)}>
                <Text style={styles.viewButtonText}>Book Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderBookings = () => {
    const isLoading = activeTab === 'upcoming' ? loadingUpcoming : loadingPast;
    const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
    const error = activeTab === 'upcoming' ? errorUpcoming : errorPast;

  if (isLoading) {
    return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    // If error and no bookings, show empty state (treat as no bookings)
    if (error && (!bookings || bookings.length === 0)) {
      // Check if it's a real error or just empty response
      const errorMessage = (error as any)?.message || '';
      if (errorMessage.includes('404') || errorMessage.includes('Not Found') || errorMessage.includes('An unexpected error occurred')) {
        // Treat as empty, not an error
        return (
          <View style={styles.centerContent}>
            <Ionicons name="calendar-outline" size={64} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'Chưa có đặt phòng sắp tới' : 'Chưa có đặt phòng đã qua'}
            </Text>
          </View>
        );
      }
    }

    if (!bookings || bookings.length === 0) {
    return (
        <View style={styles.centerContent}>
          <Ionicons name="calendar-outline" size={64} color={BOOKING_COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' ? 'Chưa có đặt phòng sắp tới' : 'Chưa có đặt phòng đã qua'}
          </Text>
        </View>
    );
  }

    return <View style={styles.bookingsList}>{bookings.map(renderBookingCard)}</View>;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}>
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {renderBookings()}
      </ScrollView>
          </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
  },
  activeTab: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  activeTabText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  bookingContent: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  roomImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  roomType: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    alignItems: 'center',
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
