import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { processPayment, PaymentRequest } from '../../apis/bookingApi';
import { useQuery } from '@tanstack/react-query';
import { getUserBookings } from '../../apis/bookingApi';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId: string }>();
  const bookingId = params.bookingId ? parseInt(params.bookingId, 10) : null;

  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD'>('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get booking details
  const { data: bookings } = useQuery({
    queryKey: ['userBookings'],
    queryFn: getUserBookings,
  });

  const currentBooking = bookings?.find((b) => b.bookingId === bookingId);

  const formatCardNumber = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setCvv(cleaned.substring(0, 4));
  };

  const handlePayment = async () => {
    if (!bookingId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin booking');
      return;
    }

    // Validate card number (remove spaces)
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      Alert.alert('Lỗi', 'Số thẻ không hợp lệ (13-19 chữ số)');
      return;
    }

    if (!cardHolderName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ thẻ');
      return;
    }

    if (expiryDate.length !== 5) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn (MM/YY)');
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Lỗi', 'CVV không hợp lệ (3-4 chữ số)');
      return;
    }

    try {
      setIsProcessing(true);
      const paymentRequest: PaymentRequest = {
        bookingId,
        cardNumber: cleanedCardNumber,
        cardHolderName: cardHolderName.trim(),
        expiryDate,
        cvv,
        paymentMethod,
      };

      const result = await processPayment(paymentRequest);

      // Navigate to success screen
      router.replace({
        pathname: '/(tabs)/booking-success',
        params: { bookingId: bookingId?.toString() || result.bookingId.toString() },
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể xử lý thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        {currentBooking && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Tóm tắt đặt phòng</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phòng:</Text>
              <Text style={styles.summaryValue}>{currentBooking.room.roomType}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Khách sạn:</Text>
              <Text style={styles.summaryValue}>{currentBooking.room.hotelName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-in:</Text>
              <Text style={styles.summaryValue}>
                {new Date(currentBooking.checkIn).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-out:</Text>
              <Text style={styles.summaryValue}>
                {new Date(currentBooking.checkOut).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng tiền:</Text>
              <Text style={styles.summaryTotal}>
                {typeof currentBooking.totalPrice === 'number'
                  ? currentBooking.totalPrice.toLocaleString('vi-VN')
                  : currentBooking.totalPrice}{' '}
                VND
              </Text>
            </View>
          </View>
        )}

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'CREDIT_CARD' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('CREDIT_CARD')}
            >
              <Ionicons
                name="card-outline"
                size={24}
                color={paymentMethod === 'CREDIT_CARD' ? '#FFFFFF' : theme.colors.primary}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'CREDIT_CARD' && styles.paymentMethodTextActive,
                ]}
              >
                Thẻ tín dụng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'DEBIT_CARD' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('DEBIT_CARD')}
            >
              <Ionicons
                name="card-outline"
                size={24}
                color={paymentMethod === 'DEBIT_CARD' ? '#FFFFFF' : theme.colors.primary}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'DEBIT_CARD' && styles.paymentMethodTextActive,
                ]}
              >
                Thẻ ghi nợ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thẻ</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số thẻ</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#9CA3AF"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
            <TextInput
              style={styles.input}
              placeholder="NGUYEN VAN A"
              placeholderTextColor="#9CA3AF"
              value={cardHolderName}
              onChangeText={setCardHolderName}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Ngày hết hạn</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.noticeSection}>
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
          <Text style={styles.noticeText}>
            Thông tin thanh toán của bạn được bảo mật và mã hóa
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Thanh toán</Text>
              {currentBooking && (
                <Text style={styles.payButtonAmount}>
                  {typeof currentBooking.totalPrice === 'number'
                    ? currentBooking.totalPrice.toLocaleString('vi-VN')
                    : currentBooking.totalPrice}{' '}
                  VND
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  summarySection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  paymentMethodTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  noticeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 20,
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  payButtonAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

