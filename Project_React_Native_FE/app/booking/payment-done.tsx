import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BOOKING_COLORS } from '@/constants/booking';
import { createBooking, BookingRequest } from '@/apis/bookingApi';

export default function PaymentDoneScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Create booking when payment is done
    const createBookingFromPayment = async () => {
      try {
        if (params.roomId && params.checkIn && params.checkOut) {
          const bookingData: BookingRequest = {
            roomId: parseInt(params.roomId as string),
            checkIn: params.checkIn as string,
            checkOut: params.checkOut as string,
            adultsCount: parseInt(params.adults as string) || 2,
            childrenCount: parseInt(params.children as string) || 0,
            infantsCount: parseInt(params.infants as string) || 0,
          };
          await createBooking(bookingData);
        }
      } catch (error) {
        console.error('Error creating booking:', error);
      }
    };

    createBookingFromPayment();
  }, []);

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' }}
        style={styles.backgroundImage}
        blurRadius={20}>
        <View style={styles.blurOverlay}>
          <View style={styles.contentCard}>
            {/* Success Indicator */}
            <View style={styles.successContainer}>
              <View style={styles.successCircle}>
                <View style={styles.successInnerCircle}>
                  <Ionicons name="checkmark" size={48} color={BOOKING_COLORS.BACKGROUND} />
                </View>
              </View>
            </View>

            {/* Success Message */}
            <Text style={styles.successTitle}>Payment Received Successfully</Text>
            <Text style={styles.successMessage}>
              Congratulations ✨ Your booking has been confirmed
            </Text>

            <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
              <Text style={styles.homeButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentCard: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BOOKING_COLORS.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: BOOKING_COLORS.PRIMARY + '40',
  },
  successInnerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  homeButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});
