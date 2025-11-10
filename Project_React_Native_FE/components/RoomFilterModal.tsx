import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export interface FilterOptions {
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  sortBy?: 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface RoomFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export default function RoomFilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: RoomFilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setFilters(resetFilters);
    onApply(resetFilters);
    onClose();
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
            <Text style={styles.modalTitle}>Lọc phòng</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* City Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Thành phố</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Nhập tên thành phố"
                placeholderTextColor="#9CA3AF"
                value={filters.city || ''}
                onChangeText={(text) => setFilters({ ...filters, city: text || undefined })}
              />
            </View>

            {/* Country Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Quốc gia</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Nhập tên quốc gia"
                placeholderTextColor="#9CA3AF"
                value={filters.country || ''}
                onChangeText={(text) => setFilters({ ...filters, country: text || undefined })}
              />
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Khoảng giá (VND/đêm)</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.filterInput, styles.priceInput]}
                  placeholder="Từ"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={filters.minPrice ? filters.minPrice.toString() : ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, minPrice: text ? parseFloat(text) : undefined })
                  }
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={[styles.filterInput, styles.priceInput]}
                  placeholder="Đến"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={filters.maxPrice ? filters.maxPrice.toString() : ''}
                  onChangeText={(text) =>
                    setFilters({ ...filters, maxPrice: text ? parseFloat(text) : undefined })
                  }
                />
              </View>
            </View>

            {/* Capacity */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Số người</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Số người tối đa"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={filters.capacity ? filters.capacity.toString() : ''}
                onChangeText={(text) =>
                  setFilters({ ...filters, capacity: text ? parseInt(text) : undefined })
                }
              />
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sắp xếp theo</Text>
              <View style={styles.sortOptions}>
                {(['price', 'rating', 'name'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortOption,
                      filters.sortBy === option && styles.sortOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: option })}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        filters.sortBy === option && styles.sortOptionTextActive,
                      ]}
                    >
                      {option === 'price' ? 'Giá' : option === 'rating' ? 'Đánh giá' : 'Tên'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Order */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Thứ tự</Text>
              <View style={styles.sortOptions}>
                {(['asc', 'desc'] as const).map((order) => (
                  <TouchableOpacity
                    key={order}
                    style={[
                      styles.sortOption,
                      filters.sortOrder === order && styles.sortOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, sortOrder: order })}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        filters.sortOrder === order && styles.sortOptionTextActive,
                      ]}
                    >
                      {order === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
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
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  filterInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  sortOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

