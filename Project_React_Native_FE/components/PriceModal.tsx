import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface PriceModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (minPrice: number | null, maxPrice: number | null) => void;
  initialMinPrice?: number;
  initialMaxPrice?: number;
}

export default function PriceModal({
  visible,
  onClose,
  onApply,
  initialMinPrice,
  initialMaxPrice,
}: PriceModalProps) {
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setMinPrice(initialMinPrice ? initialMinPrice.toString() : '');
      setMaxPrice(initialMaxPrice ? initialMaxPrice.toString() : '');
    }
  }, [visible, initialMinPrice, initialMaxPrice]);

  const handleApply = () => {
    const min = minPrice.trim() ? parseFloat(minPrice.trim()) : null;
    const max = maxPrice.trim() ? parseFloat(maxPrice.trim()) : null;
    
    // Validate
    if (min !== null && isNaN(min)) {
      return;
    }
    if (max !== null && isNaN(max)) {
      return;
    }
    if (min !== null && max !== null && min > max) {
      return;
    }
    
    onApply(min, max);
    onClose();
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    onApply(null, null);
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
          <View style={styles.dragIndicator} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Price Range</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.filterLabel}>Enter price range (VND/night)</Text>
            
            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceLabel}>From</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Start price"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
              </View>
              
              <View style={styles.priceSeparator}>
                <Text style={styles.separatorText}>→</Text>
              </View>
              
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceLabel}>To</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="End price"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>

            {(minPrice || maxPrice) && (
              <View style={styles.pricePreview}>
                <Text style={styles.previewText}>
                  {minPrice ? `${parseInt(minPrice).toLocaleString('vi-VN')} VND` : 'Any'} 
                  {' → '}
                  {maxPrice ? `${parseInt(maxPrice).toLocaleString('vi-VN')} VND` : 'Any'}
                </Text>
              </View>
            )}
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
    maxHeight: '60%',
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
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceSeparator: {
    paddingBottom: 8,
    justifyContent: 'center',
  },
  separatorText: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  pricePreview: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
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

