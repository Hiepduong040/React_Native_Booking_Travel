import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { BOOKING_COLORS } from '@/constants/booking';

// Discount codes database (trong thực tế sẽ lấy từ backend)
const DISCOUNT_CODES: Record<string, { type: 'percentage' | 'fixed'; value: number; minAmount?: number }> = {
  WELCOME10: { type: 'percentage', value: 10 }, // 10% off
  SAVE20: { type: 'fixed', value: 20 }, // $20 off
  SAVE50: { type: 'fixed', value: 50, minAmount: 200 }, // $50 off if order >= $200
  DISCOUNT15: { type: 'percentage', value: 15 }, // 15% off
  NEWUSER: { type: 'percentage', value: 20 }, // 20% off for new users
};

export default function ConfirmPayScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  
  const adults = parseInt(params.adults as string) || 2;
  const children = parseInt(params.children as string) || 0;
  const infants = parseInt(params.infants as string) || 0;
  
  // Get room price from params
  const roomPrice = parseFloat(params.roomPrice as string) || 0;
  
  // Calculate number of nights from checkIn and checkOut
  const checkIn = params.checkIn ? new Date(params.checkIn as string) : new Date();
  const checkOut = params.checkOut ? new Date(params.checkOut as string) : new Date();
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate total price: room price * number of guests * number of nights
  const totalGuests = adults + children; // infants don't count
  const subtotal = roomPrice * totalGuests * nights;
  
  // Calculate discount
  const calculateDiscount = (code: string): number => {
    const upperCode = code.toUpperCase().trim();
    const discountInfo = DISCOUNT_CODES[upperCode];
    
    if (!discountInfo) {
      return 0;
    }
    
    if (discountInfo.minAmount && subtotal < discountInfo.minAmount) {
      return 0;
    }
    
    if (discountInfo.type === 'percentage') {
      return Math.round((subtotal * discountInfo.value) / 100);
    } else {
      // Fixed amount, but not more than subtotal
      return Math.min(discountInfo.value, subtotal);
    }
  };
  
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const taxes = Math.round((subtotal - discountAmount) * 0.1); // 10% tax on discounted amount
  const total = subtotal - discountAmount + taxes;
  
  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    const upperCode = discountCode.toUpperCase().trim();
    const discountInfo = DISCOUNT_CODES[upperCode];
    
    if (!discountInfo) {
      setDiscountError('Mã giảm giá không hợp lệ');
      setAppliedDiscount(null);
      return;
    }
    
    if (discountInfo.minAmount && subtotal < discountInfo.minAmount) {
      setDiscountError(`Đơn hàng tối thiểu $${discountInfo.minAmount} để sử dụng mã này`);
      setAppliedDiscount(null);
      return;
    }
    
    const discount = calculateDiscount(upperCode);
    if (discount > 0) {
      setAppliedDiscount({ code: upperCode, amount: discount });
      setDiscountError('');
      Alert.alert('Thành công', `Mã giảm giá "${upperCode}" đã được áp dụng!`);
    } else {
      setDiscountError('Mã giảm giá không hợp lệ');
      setAppliedDiscount(null);
    }
  };
  
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const handlePayNow = () => {
    // Pass all booking params to add card screen
    router.push({
      pathname: '/booking/add-card',
      params: {
        ...params,
        roomId: params.roomId || '',
        checkIn: params.checkIn || '2023-05-06',
        checkOut: params.checkOut || '2023-05-08',
        totalPrice: total.toFixed(2),
        discountCode: appliedDiscount?.code || '',
        discountAmount: discountAmount.toFixed(2),
      },
    });
  };

  const renderRadioOption = (
    label: string,
    subtitle: string,
    value: 'full' | 'partial',
    selected: boolean,
  ) => {
    return (
      <TouchableOpacity
        style={styles.radioOption}
        onPress={() => setPaymentType(value)}>
        <View style={styles.radioButtonContainer}>
          <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
            {selected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
        <View style={styles.radioTextContainer}>
          <Text style={styles.radioLabel}>{label}</Text>
          <Text style={styles.radioSubtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Confirm & Pay</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Property Details Card */}
        <View style={styles.propertyCard}>
          <ExpoImage
            source={{ uri: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200' }}
            style={styles.propertyImage}
            contentFit="cover"
          />
          <View style={styles.propertyInfo}>
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={14} color={BOOKING_COLORS.RATING} />
              ))}
              <Text style={styles.ratingText}>4.0 (115 Reviews)</Text>
            </View>
            <Text style={styles.propertyName}>Malon Greens</Text>
            <Text style={styles.propertyLocation}>Mumbai, Maharashtra</Text>
            <Text style={styles.propertySummary}>
              {adults} adults | {children} children
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Booking Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Dates</Text>
              <Text style={styles.detailValue}>May 06, 2023 - May 08, 2023</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color={BOOKING_COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailValue}>
                {adults} adults | {children} {children === 1 ? 'child' : 'children'}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color={BOOKING_COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose how to pay</Text>
          {renderRadioOption(
            'Pay in full',
            'Pay the total now and you\'re all set.',
            'full',
            paymentType === 'full',
          )}
          {renderRadioOption(
            'Pay part now, part later',
            'Pay part now and you\'re all set.',
            'partial',
            paymentType === 'partial',
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay with</Text>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.detailLabel}>Payment method</Text>
              <View style={styles.paymentIcons}>
                <Ionicons name="card-outline" size={24} color={BOOKING_COLORS.TEXT_SECONDARY} />
                <Ionicons name="wallet-outline" size={24} color={BOOKING_COLORS.TEXT_SECONDARY} />
                <Ionicons name="logo-google" size={24} color={BOOKING_COLORS.TEXT_SECONDARY} />
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Discount Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discount Code</Text>
          {appliedDiscount ? (
            <View style={styles.discountAppliedContainer}>
              <View style={styles.discountAppliedInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.discountAppliedText}>
                  Mã "{appliedDiscount.code}" đã được áp dụng: -${appliedDiscount.amount.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveDiscount}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.discountInputContainer}>
              <TextInput
                style={[styles.discountInput, discountError && styles.discountInputError]}
                placeholder="Nhập mã giảm giá"
                placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                value={discountCode}
                onChangeText={(text) => {
                  setDiscountCode(text.toUpperCase());
                  setDiscountError('');
                }}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyDiscount}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          )}
          {discountError ? (
            <Text style={styles.discountErrorText}>{discountError}</Text>
          ) : null}
          <Text style={styles.discountHint}>
            Mã giảm giá mẫu: WELCOME10 (10% off), SAVE20 ($20 off), DISCOUNT15 (15% off)
          </Text>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>${roomPrice.toFixed(2)} x {totalGuests} guests x {nights} nights</Text>
            <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount ({appliedDiscount?.code})</Text>
              <Text style={[styles.priceValue, styles.discountValue]}>-${discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Occupancy taxes and fees</Text>
            <Text style={styles.priceValue}>${taxes.toFixed(2)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  propertySummary: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButtonContainer: {
    marginRight: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: BOOKING_COLORS.PRIMARY,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  radioTextContainer: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  radioSubtitle: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentIcons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  discountValue: {
    color: '#10B981',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRIMARY,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  payButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  discountInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  discountInput: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  discountInputError: {
    borderColor: '#EF4444',
  },
  applyButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  discountErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  discountHint: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginTop: 8,
    fontStyle: 'italic',
  },
  discountAppliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  discountAppliedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  discountAppliedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    flex: 1,
  },
});
