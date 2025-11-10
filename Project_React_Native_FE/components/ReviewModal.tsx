import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { createReview, ReviewRequest } from '../apis/reviewApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  hotelId: number;
  hotelName?: string;
  roomId?: number;
}

export default function ReviewModal({
  visible,
  onClose,
  hotelId,
  hotelName,
  roomId,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', roomId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'hotel', hotelId] });
      Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi');
      setRating(5);
      setComment('');
      onClose();
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.message || 'Không thể gửi đánh giá');
    },
  });

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Lỗi', 'Vui lòng chọn điểm đánh giá từ 1 đến 5 sao');
      return;
    }

    const reviewRequest: ReviewRequest = {
      hotelId,
      rating,
      comment: comment.trim() || undefined,
    };

    createReviewMutation.mutate(reviewRequest);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đánh giá</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {hotelName && (
              <Text style={styles.hotelName}>{hotelName}</Text>
            )}

            {/* Rating Selection */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Đánh giá của bạn</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#FFD700' : '#D1D5DB'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {rating === 1
                  ? 'Rất tệ'
                  : rating === 2
                  ? 'Tệ'
                  : rating === 3
                  ? 'Bình thường'
                  : rating === 4
                  ? 'Tốt'
                  : 'Rất tốt'}
              </Text>
            </View>

            {/* Comment Input */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Nhận xét (tùy chọn)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.commentHint}>
                {comment.length}/500 ký tự
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={createReviewMutation.isPending}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, createReviewMutation.isPending && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
    maxHeight: '70%',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 24,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

