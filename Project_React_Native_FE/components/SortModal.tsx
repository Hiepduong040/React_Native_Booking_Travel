import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export type SortOrder = 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc' | null;

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (sortOrder: SortOrder) => void;
  initialSortOrder?: SortOrder;
}

export default function SortModal({
  visible,
  onClose,
  onApply,
  initialSortOrder = null,
}: SortModalProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder || null);

  useEffect(() => {
    if (visible) {
      setSortOrder(initialSortOrder);
    }
  }, [visible, initialSortOrder]);

  const handleApply = () => {
    onApply(sortOrder);
    onClose();
  };

  const handleClear = () => {
    setSortOrder(null);
    onApply(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort by</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setSortOrder('price_asc')}
            >
              <View style={styles.radioButton}>
                {sortOrder === 'price_asc' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <Text style={styles.sortOptionText}>Price - low to high</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setSortOrder('price_desc')}
            >
              <View style={styles.radioButton}>
                {sortOrder === 'price_desc' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <Text style={styles.sortOptionText}>Price - high to low</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setSortOrder('rating_desc')}
            >
              <View style={styles.radioButton}>
                {sortOrder === 'rating_desc' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="star-outline" size={20} color="#6B7280" />
              <Text style={styles.sortOptionText}>Rating - high to low</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setSortOrder('rating_asc')}
            >
              <View style={styles.radioButton}>
                {sortOrder === 'rating_asc' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="star-outline" size={20} color="#6B7280" />
              <Text style={styles.sortOptionText}>Rating - low to high</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
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
    gap: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  clearButtonText: {
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

