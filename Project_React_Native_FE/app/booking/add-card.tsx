import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BOOKING_COLORS } from '@/constants/booking';

export default function AddCardScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState<string>('8976 5467 XX87 0098');
  const [cardHolderName, setCardHolderName] = useState<string>('Curtis Weaver');
  const [expiryDate, setExpiryDate] = useState<string>('12/2026');
  const [cvv, setCvv] = useState<string>('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 6);
    }
    return cleaned;
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    if (formatted.length <= 7) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      setCvv(cleaned);
    }
  };

  const handleAddCard = () => {
    // In real app, validate and process card
    // Pass booking params to payment done screen
    router.push({
      pathname: '/booking/payment-done',
      params: params,
    });
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
            <Text style={styles.title}>Add New Card</Text>

            {/* Card Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            {/* Card Holder Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Holder Name</Text>
              <TextInput
                style={styles.input}
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder="John Doe"
                placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                autoCapitalize="words"
              />
            </View>

            {/* Expiry Date and CVV */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  placeholder="MM/YYYY"
                  placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                  keyboardType="numeric"
                  maxLength={7}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="***"
                  placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
              <Text style={styles.addButtonText}>Add Card</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});
