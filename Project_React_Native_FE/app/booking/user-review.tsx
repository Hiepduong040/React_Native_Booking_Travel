import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BOOKING_COLORS } from '@/constants/booking';
import { createReview, updateReview, getMyReviewByRoomId, ReviewRequest, ReviewResponse } from '@/apis/reviewApi';

export default function WriteReviewScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const roomId = parseInt(params.roomId as string) || 0;
  const hotelName = params.hotelName as string || '';

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingReview, setLoadingReview] = useState<boolean>(true);
  const [existingReview, setExistingReview] = useState<ReviewResponse | null>(null);

  useEffect(() => {
    loadExistingReview();
  }, [roomId]);

  const loadExistingReview = async () => {
    if (!roomId) {
      setLoadingReview(false);
      return;
    }
    try {
      setLoadingReview(true);
      const review = await getMyReviewByRoomId(roomId);
      if (review) {
        setExistingReview(review);
        setRating(review.rating);
        setComment(review.comment);
      }
    } catch (error) {
      console.error('Error loading existing review:', error);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đánh giá của bạn');
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao từ 1 đến 5');
      return;
    }

    try {
      setLoading(true);
      const reviewData: ReviewRequest = {
        roomId,
        rating,
        comment: comment.trim(),
      };
      
      if (existingReview) {
        // Update existing review
        await updateReview(existingReview.reviewId, reviewData);
        Alert.alert('Thành công', 'Đánh giá của bạn đã được cập nhật', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        // Create new review
        await createReview(reviewData);
        Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? BOOKING_COLORS.RATING : BOOKING_COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={styles.backButton} />
      </View>

      {loadingReview ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Hotel Name */}
          {hotelName && (
            <View style={styles.hotelNameContainer}>
              <Text style={styles.hotelNameText}>{hotelName}</Text>
              {existingReview && (
                <Text style={styles.editNote}>Bạn đang chỉnh sửa đánh giá của mình</Text>
              )}
            </View>
          )}

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            {renderStars()}
            <Text style={styles.ratingText}>{rating} out of 5 stars</Text>
          </View>

          {/* Comment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Hãy chia sẻ trải nghiệm của bạn về phòng này..."
              placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{comment.length} characters</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={BOOKING_COLORS.BACKGROUND} />
            ) : (
              <Text style={styles.submitButtonText}>
                {existingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  commentInput: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  hotelNameContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  hotelNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  editNote: {
    fontSize: 14,
    color: BOOKING_COLORS.PRIMARY,
    fontStyle: 'italic',
  },
});
