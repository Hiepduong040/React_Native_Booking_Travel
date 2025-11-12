import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getRoomById, RoomDetailResponse } from '../../../apis/roomApi';
import { getReviewsByHotelId, getMyReviewByRoomId } from '../../../apis/reviewApi';
import { getPastBookings, getUpcomingBookings, BookingResponse } from '../../../apis/bookingApi';
import { theme } from '../../../constants/theme';
import ReviewModal from '../../../components/ReviewModal';
import ReviewList from '../../../components/ReviewList';
import { useAuth } from '../../../contexts/AuthContext';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function RoomDetailScreen() {
  const params = useLocalSearchParams<{ id: string; openReviewModal?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const autoOpenHandledRef = useRef(false);
  const { isAuthenticated, user } = useAuth();

  // Ensure we get the correct id from params
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const roomId = id ? parseInt(id, 10) : 0;

  // Clear cache when roomId changes to ensure fresh data
  useEffect(() => {
    if (roomId > 0) {
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  }, [roomId, queryClient]);

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoomById(roomId),
    enabled: !!id && !isNaN(roomId) && roomId > 0,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  // Get hotelId from room for reviews
  const hotelId = room?.hotel?.hotelId;

  const {
    data: reviews,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ['reviews', 'hotel', hotelId],
    queryFn: () => getReviewsByHotelId(hotelId!),
    enabled: typeof hotelId === 'number' && hotelId > 0,
    staleTime: 60 * 1000,
  });

  const {
    data: myReview,
    isLoading: loadingMyReview,
  } = useQuery({
    queryKey: ['myReview', roomId],
    queryFn: () => getMyReviewByRoomId(roomId),
    enabled: isAuthenticated && roomId > 0,
    staleTime: 60 * 1000,
  });

  const hasReviews = (reviews?.length || 0) > 0;
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  const {
    data: pastBookings,
    isLoading: loadingPastBookings,
  } = useQuery({
    queryKey: ['userBookings', 'past'],
    queryFn: getPastBookings,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: upcomingBookings,
    isLoading: loadingUpcomingBookings,
  } = useQuery({
    queryKey: ['userBookings', 'upcoming'],
    queryFn: getUpcomingBookings,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const bookingsLoading = loadingPastBookings || loadingUpcomingBookings;

  const relevantBookings = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }
    return [
      ...(pastBookings || []),
      ...(upcomingBookings || []),
    ];
  }, [isAuthenticated, pastBookings, upcomingBookings]);

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

  const hasEligibleStay = useMemo(() => {
    if (!relevantBookings || relevantBookings.length === 0 || roomId <= 0) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return relevantBookings.some((booking) => {
      const bookingRoomId = booking.roomId || booking.room?.roomId;
      if (bookingRoomId !== roomId) {
        return false;
      }
      if (booking.status === 'CANCELLED') {
        return false;
      }

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
    });
  }, [relevantBookings, roomId]);

  const userReview = useMemo(() => {
    if (myReview !== undefined) {
      return myReview;
    }
    if (!user || !reviews || reviews.length === 0) {
      return null;
    }
    return (
      reviews.find((review) => {
        const sameId = review.user?.userId != null && review.user.userId === user.id;
        const sameEmail =
          review.user?.email &&
          user.email &&
          review.user.email.toLowerCase() === user.email.toLowerCase();
        return sameId || sameEmail;
      }) || null
    );
  }, [myReview, reviews, user]);

  const canAddReview = isAuthenticated && hasEligibleStay && !userReview;
  const canEditReview = isAuthenticated && hasEligibleStay && Boolean(userReview);

  const handleAddReviewPress = () => {
    if (!hasEligibleStay) {
      Alert.alert('Chưa thể đánh giá', 'Bạn chỉ có thể đánh giá sau khi đã sử dụng dịch vụ (hoặc trong thời gian lưu trú).');
      return;
    }
    setShowReviewModal(true);
  };

  const handleEditReviewPress = () => {
    if (!hasEligibleStay) {
      Alert.alert('Chưa thể chỉnh sửa', 'Bạn chỉ có thể chỉnh sửa đánh giá khi đã sử dụng dịch vụ.');
      return;
    }
    setShowEditModal(true);
  };

  useEffect(() => {
    autoOpenHandledRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (params.openReviewModal === 'true') {
      if (autoOpenHandledRef.current) {
        return;
      }

      if (loadingMyReview || bookingsLoading) {
        return;
      }

      if (canEditReview) {
        setShowEditModal(true);
        autoOpenHandledRef.current = true;
      } else if (canAddReview) {
        setShowReviewModal(true);
        autoOpenHandledRef.current = true;
      } else if (isAuthenticated && !bookingsLoading) {
        Alert.alert('Chưa thể đánh giá', 'Bạn chỉ có thể đánh giá sau khi đã sử dụng dịch vụ (hoặc trong thời gian lưu trú).');
        autoOpenHandledRef.current = true;
      }
    } else {
      autoOpenHandledRef.current = false;
    }
  }, [params.openReviewModal, canEditReview, canAddReview, isAuthenticated, bookingsLoading, loadingMyReview]);

  const renderStars = (rating: number) => (
    <View style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={16}
          color={star <= rating ? '#FFD700' : '#D1D5DB'}
        />
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Không thể tải thông tin phòng</Text>
          <Text style={styles.errorDetail}>{errorMessage}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => router.replace('/(tabs)/booking')}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Không tìm thấy phòng</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => router.replace('/(tabs)/booking')}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allImages = [
    ...(room.images || []),
    ...(room.hotel?.images || []),
  ].filter(Boolean);

  const mainImage = allImages[selectedImageIndex] || allImages[0] || 'https://via.placeholder.com/400';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              // Navigate back to booking screen directly
              router.replace('/(tabs)/booking');
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Main Image */}
        <TouchableOpacity
          style={styles.mainImageContainer}
          activeOpacity={0.9}
          onPress={() => {
            router.push({
              pathname: '/(tabs)/(products)/photos',
              params: {
                images: allImages.join(','),
                initialIndex: selectedImageIndex.toString(),
              },
            });
          }}
        >
          <Image source={{ uri: mainImage }} style={styles.mainImage} resizeMode="cover" />
          {allImages.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {selectedImageIndex + 1} / {allImages.length}
              </Text>
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Image Gallery */}
        {allImages.length > 1 && (
          <View style={styles.galleryContainer}>
            <View style={styles.galleryHeader}>
              <Text style={styles.galleryTitle}>Photos</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/(products)/photos',
                    params: {
                      images: allImages.join(','),
                      initialIndex: selectedImageIndex.toString(),
                    },
                  });
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={allImages.slice(0, 5)} // Show only first 5 images
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `image-${index}`}
              contentContainerStyle={styles.galleryScroll}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.galleryItem,
                    selectedImageIndex === index && styles.galleryItemActive,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        
        {/* See All Button for single image or when gallery is hidden */}
        {allImages.length === 1 && (
          <View style={styles.galleryContainer}>
            <TouchableOpacity
              style={styles.seeAllButtonFull}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/(products)/photos',
                  params: {
                    images: allImages.join(','),
                    initialIndex: '0',
                  },
                });
              }}
            >
              <Text style={styles.seeAllTextFull}>See All Photos</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Room Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.roomType}>{room.roomType}</Text>
              {room.hotel && (
                <View style={styles.hotelInfo}>
                  <Ionicons name="business-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.hotelName}>{room.hotel.hotelName}</Text>
                </View>
              )}
              {hasReviews && (
                <View style={styles.ratingSummary}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
                  </View>
                  {renderStars(Math.round(averageRating))}
                  <Text style={styles.ratingCount}>
                    {reviews?.length} đánh giá
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {typeof room.price === 'number'
                  ? room.price.toLocaleString('vi-VN')
                  : room.price}
              </Text>
              <Text style={styles.priceUnit}> VND/đêm</Text>
            </View>
          </View>

          {/* Location */}
          {room.hotel && (room.hotel.city || room.hotel.address) && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={18} color="#9CA3AF" />
              <Text style={styles.locationText}>
                {room.hotel.address || room.hotel.city || ''}
                {room.hotel.city && room.hotel.address ? `, ${room.hotel.city}` : ''}
                {room.hotel.country ? `, ${room.hotel.country}` : ''}
              </Text>
            </View>
          )}

          {/* Room Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>{room.capacity} người</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>{room.roomType}</Text>
            </View>
          </View>

          {/* Description */}
          {room.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Mô tả</Text>
              <Text style={styles.descriptionText}>{room.description}</Text>
            </View>
          )}

          {/* Hotel Description */}
          {room.hotel?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Về khách sạn</Text>
              <Text style={styles.descriptionText}>{room.hotel.description}</Text>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <View>
                <Text style={styles.descriptionTitle}>Đánh giá</Text>
                {hasReviews && (
                  <View style={styles.reviewsMeta}>
                    <Text style={styles.reviewsMetaText}>
                      Trung bình {averageRating.toFixed(1)}/5 • {reviews?.length} lượt
                    </Text>
                  </View>
                )}
              </View>
              {canEditReview ? (
                <TouchableOpacity
                  style={styles.addReviewButton}
                  onPress={handleEditReviewPress}
                >
                  <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.addReviewText}>Chỉnh sửa đánh giá</Text>
                </TouchableOpacity>
              ) : canAddReview ? (
                <TouchableOpacity
                  style={styles.addReviewButton}
                  onPress={handleAddReviewPress}
                  disabled={bookingsLoading}
                >
                  <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.addReviewText}>
                    {bookingsLoading ? 'Đang kiểm tra...' : 'Thêm đánh giá'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <ReviewList reviews={reviews || []} isLoading={reviewsLoading} />
            {isAuthenticated && !userReview && !bookingsLoading && !loadingMyReview && relevantBookings && relevantBookings.length > 0 && !hasEligibleStay && (
              <Text style={styles.reviewHint}>
                Vui lòng sử dụng dịch vụ trước khi gửi đánh giá về khách sạn này.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Booking Button */}
      <View style={styles.footer}>
          <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            // Navigate to booking details screen with room ID
            router.push({
              pathname: '/(tabs)/booking-details',
              params: { roomId: roomId.toString() },
            });
          }}
        >
          <Text style={styles.bookButtonText}>Đặt phòng ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      {room && room.hotel && (
        <ReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          hotelId={room.hotel.hotelId}
          hotelName={room.hotel.hotelName}
          roomId={room.roomId}
          initialReview={null}
        />
      )}

      {/* Edit Review Modal */}
      {room && room.hotel && userReview && (
        <ReviewModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          hotelId={room.hotel.hotelId}
          hotelName={room.hotel.hotelName}
          roomId={room.roomId}
          initialReview={userReview}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainImageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  seeAllButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 8,
    marginHorizontal: 20,
  },
  seeAllTextFull: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  galleryScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  galleryItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  galleryItemActive: {
    borderColor: theme.colors.primary,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  roomType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  hotelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hotelName: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B45309',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewsSection: {
    marginTop: 8,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsMeta: {
    marginTop: 4,
  },
  reviewsMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  addReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  reviewHint: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
