import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReviewResponse } from '../apis/reviewApi';

interface ReviewListProps {
  reviews: ReviewResponse[];
  isLoading?: boolean;
}

export default function ReviewList({ reviews, isLoading }: ReviewListProps) {
  const totalReviews = reviews?.length || 0;
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6C63FF" />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        <Text style={styles.emptySubText}>Hãy là người đầu tiên đánh giá!</Text>
      </View>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getUserDisplayName = (user: ReviewResponse['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email?.split('@')[0] || 'Người dùng';
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <View>
          <Text style={styles.title}>Đánh giá ({totalReviews})</Text>
          <Text style={styles.subtitle}>Chia sẻ trải nghiệm thực tế từ khách đã lưu trú</Text>
        </View>
        {totalReviews > 0 && (
          <View style={styles.averageRatingCard}>
            <Text style={styles.averageRatingValue}>{averageRating.toFixed(1)}</Text>
            <View style={styles.averageRatingStars}>{renderStars(Math.round(averageRating))}</View>
            <Text style={styles.averageRatingCount}>{totalReviews} lượt đánh giá</Text>
          </View>
        )}
      </View> */}

      <ScrollView style={styles.reviewsList} showsVerticalScrollIndicator={false}>
        {reviews.map((review) => (
          <View key={review.reviewId} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.userInfo}>
                {review.user.avatarUrl ? (
                  <Image
                    source={{ uri: review.user.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={20} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {getUserDisplayName(review.user)}
                  </Text>
                  <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
              </View>
              {renderStars(review.rating)}
            </View>

            {review.comment && (
              <Text style={styles.reviewComment}>{review.comment}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  averageRatingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 120,
  },
  averageRatingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4338CA',
    marginBottom: 4,
  },
  averageRatingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  averageRatingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  averageRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsList: {
    flex: 1,
  },
  reviewCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },
});

