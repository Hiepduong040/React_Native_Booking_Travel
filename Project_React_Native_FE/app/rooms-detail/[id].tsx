import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { BOOKING_COLORS } from '@/constants/booking';
import { getRoomById, RoomResponse } from '@/apis/roomApi';
import { getReviewsByRoomId, ReviewResponse } from '@/apis/reviewApi';

export default function RoomDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRoomDetail();
  }, [id]);

  const loadRoomDetail = async () => {
    try {
      setLoading(true);
      const roomId = parseInt(id || '0', 10);
      if (isNaN(roomId)) {
        Alert.alert('Lỗi', 'ID phòng không hợp lệ');
        router.back();
        return;
      }
      const data = await getRoomById(roomId);
      setRoom(data);
      
      // Load reviews for this room
      try {
        const reviewsData = await getReviewsByRoomId(roomId);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Load reviews error:', error);
      }
    } catch (error) {
      console.error('Load room detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !room) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
        <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerButton, styles.headerButtonTransparent]}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={[styles.headerButton, styles.headerButtonTransparent]}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? BOOKING_COLORS.HEART : BOOKING_COLORS.BACKGROUND}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Main Image */}
        <View style={[styles.imageContainer, { width }]}>
          <ExpoImage
            source={{
              uri:
                room.imageUrls && room.imageUrls.length > 0
                  ? room.imageUrls[0]
                  : "https://via.placeholder.com/400x200?text=No+Image",
            }}
            style={styles.mainImage}
            contentFit="cover"
            transition={200}
          />
        </View>


        {/* Room Info */}
        <View style={styles.content}>
          <Text style={styles.roomName}>{room.roomType}</Text>

          {/* Rating */}
          {room.rating && room.rating > 0 && (
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(room.rating || 0) ? 'star' : 'star-outline'}
                  size={16}
                  color={BOOKING_COLORS.RATING}
                />
              ))}
              <Text style={styles.ratingText}>
                {room.rating.toFixed(1)} ({room.reviewCount || 0} Reviews)
              </Text>
            </View>
          )}

          <View style={styles.locationRow}>
            <Ionicons name="business-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.location}>
              {room.hotelName || 'Thuộc khách sạn không xác định'}
            </Text>
          </View>

          {/* Description */}
          {room.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.overviewText}>{room.description}</Text>
            </View>
          )}

          {/* Photos */}
          {room.imageUrls && room.imageUrls.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hình ảnh</Text>
              </View>
              <FlatList
                data={room.imageUrls}
                renderItem={({ item }) => (
                  <View style={styles.photoThumbnail}>
                    <ExpoImage
                      source={{ uri: item }}
                      style={styles.photoImage}
                      contentFit="cover"
                    />
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
              />
            </View>
          )}

          {/* Room Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết phòng</Text>
            <Text style={styles.featureText}>Sức chứa: {room.capacity} người</Text>
          </View>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá ({reviews.length})</Text>
              {reviews.slice(0, 5).map((review) => (
                <View key={review.reviewId} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewUserName}>{review.userName}</Text>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color={BOOKING_COLORS.RATING}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
              {reviews.length > 5 && (
                <TouchableOpacity
                  style={styles.viewAllReviews}
                  onPress={() => {
                    // Navigate to reviews screen if needed
                  }}>
                  <Text style={styles.viewAllReviewsText}>
                    Xem tất cả {reviews.length} đánh giá
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.priceContainer}>
          {room.price && room.price > 0 ? (
            <>
              <Text style={styles.priceLabel}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
              </Text>
              <Text style={styles.priceSubLabel}>/đêm</Text>
            </>
          ) : (
            <Text style={styles.priceLabel}>Liên hệ để biết giá</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.selectDateButton}
          onPress={() => {
            router.push({
              pathname: '/booking/select-guest',
              params: {
                roomId: id,
                roomName: room.roomType,
                roomPrice: room.price?.toString() || '0',
              },
            });
          }}>
          <Text style={styles.selectDateText}>Đặt phòng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BOOKING_COLORS.BACKGROUND },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, zIndex: 10,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerButtonTransparent: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 20 },
  headerRight: { flexDirection: 'row', gap: 8 },
  scrollView: { flex: 1 },
  imageContainer: { height: 300 },
  mainImage: { width: '100%', height: '100%' },
  content: { padding: 16 },
  roomName: { fontSize: 24, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24 },
  location: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, marginBottom: 12 },
  overviewText: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY, lineHeight: 24 },
  photosList: { gap: 12 },
  photoThumbnail: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  featureText: { fontSize: 16, color: BOOKING_COLORS.TEXT_PRIMARY, lineHeight: 24, marginBottom: 8 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  reviewComment: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  viewAllReviews: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllReviewsText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopWidth: 1, borderTopColor: BOOKING_COLORS.BORDER,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceLabel: { fontSize: 20, fontWeight: '700', color: BOOKING_COLORS.PRICE },
  priceSubLabel: { fontSize: 14, fontWeight: '500', color: BOOKING_COLORS.TEXT_SECONDARY },
  selectDateButton: { backgroundColor: BOOKING_COLORS.PRIMARY, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  selectDateText: { fontSize: 16, fontWeight: '600', color: BOOKING_COLORS.BACKGROUND },
});