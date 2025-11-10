import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { createBooking, BookingRequest } from '../../apis/bookingApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ roomId: string }>();
  const roomId = params.roomId ? parseInt(params.roomId, 10) : null;

  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCheckInConfirm = (selectedDate: Date) => {
    setCheckIn(selectedDate);
    setShowCheckInPicker(false);
    // Auto set check-out to next day if it's before check-in
    if (checkOut <= selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay);
    }
  };

  const handleCheckOutConfirm = (selectedDate: Date) => {
    if (selectedDate > checkIn) {
      setCheckOut(selectedDate);
      setShowCheckOutPicker(false);
    } else {
      Alert.alert('Lỗi', 'Ngày check-out phải sau ngày check-in');
      setShowCheckOutPicker(false);
    }
  };

  const handleSubmit = async () => {
    if (!roomId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin phòng');
      return;
    }

    if (checkOut <= checkIn) {
      Alert.alert('Lỗi', 'Ngày check-out phải sau ngày check-in');
      return;
    }

    if (adultsCount < 1) {
      Alert.alert('Lỗi', 'Số người lớn phải ít nhất là 1');
      return;
    }

    try {
      setIsSubmitting(true);
      const checkInStr = formatDateForAPI(checkIn);
      const checkOutStr = formatDateForAPI(checkOut);
      
      console.log('Creating booking with dates:', {
        checkIn: checkInStr,
        checkOut: checkOutStr,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        today: new Date().toISOString().split('T')[0],
      });
      
      const bookingRequest: BookingRequest = {
        roomId,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        adultsCount,
        childrenCount,
        infantsCount,
      };

      const booking = await createBooking(bookingRequest);
      
      // Navigate to payment screen
      router.push({
        pathname: '/(tabs)/payment',
        params: { bookingId: booking.bookingId.toString() },
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin đặt phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCheckInPicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Check-in</Text>
                  <Text style={styles.dateValue}>{formatDate(checkIn)}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Check-out</Text>
                  <Text style={styles.dateValue}>{formatDate(checkOut)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={showCheckInPicker}
            mode="date"
            date={checkIn}
            minimumDate={new Date()}
            onConfirm={handleCheckInConfirm}
            onCancel={() => setShowCheckInPicker(false)}
          />

          <DateTimePickerModal
            isVisible={showCheckOutPicker}
            mode="date"
            date={checkOut}
            minimumDate={new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)}
            onConfirm={handleCheckOutConfirm}
            onCancel={() => setShowCheckOutPicker(false)}
          />
        </View>

        {/* Guest Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số người</Text>

          {/* Adults */}
          <View style={styles.guestRow}>
            <View style={styles.guestInfo}>
              <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
              <View style={styles.guestText}>
                <Text style={styles.guestLabel}>Người lớn</Text>
                <Text style={styles.guestSubLabel}>Từ 13 tuổi trở lên</Text>
              </View>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setAdultsCount(Math.max(1, adultsCount - 1))}
              >
                <Ionicons name="remove" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{adultsCount}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setAdultsCount(adultsCount + 1)}
              >
                <Ionicons name="add" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Children */}
          <View style={styles.guestRow}>
            <View style={styles.guestInfo}>
              <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              <View style={styles.guestText}>
                <Text style={styles.guestLabel}>Trẻ em</Text>
                <Text style={styles.guestSubLabel}>Từ 2 đến 12 tuổi</Text>
              </View>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setChildrenCount(Math.max(0, childrenCount - 1))}
              >
                <Ionicons name="remove" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{childrenCount}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setChildrenCount(childrenCount + 1)}
              >
                <Ionicons name="add" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Infants */}
          <View style={styles.guestRow}>
            <View style={styles.guestInfo}>
              <Ionicons name="happy-outline" size={24} color={theme.colors.primary} />
              <View style={styles.guestText}>
                <Text style={styles.guestLabel}>Trẻ sơ sinh</Text>
                <Text style={styles.guestSubLabel}>Dưới 2 tuổi</Text>
              </View>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setInfantsCount(Math.max(0, infantsCount - 1))}
              >
                <Ionicons name="remove" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{infantsCount}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setInfantsCount(infantsCount + 1)}
              >
                <Ionicons name="add" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Đang xử lý...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Tiếp tục</Text>
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  dateRow: {
    gap: 12,
  },
  dateButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  guestText: {
    flex: 1,
  },
  guestLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  guestSubLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

