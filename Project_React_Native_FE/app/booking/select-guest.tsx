import React, { useState } from 'react';
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

export default function SelectGuestScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [adults, setAdults] = useState<number>(parseInt(params.adults as string) || 2);
  const [children, setChildren] = useState<number>(parseInt(params.children as string) || 2);
  const [infants, setInfants] = useState<number>(parseInt(params.infants as string) || 0);

  const handleIncrement = (type: 'adults' | 'children' | 'infants') => {
    if (type === 'adults') {
      setAdults(prev => prev + 1);
    } else if (type === 'children') {
      setChildren(prev => prev + 1);
    } else {
      setInfants(prev => prev + 1);
    }
  };

  const handleDecrement = (type: 'adults' | 'children' | 'infants') => {
    if (type === 'adults') {
      setAdults(prev => Math.max(1, prev - 1));
    } else if (type === 'children') {
      setChildren(prev => Math.max(0, prev - 1));
    } else {
      setInfants(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    router.push({
      pathname: '/booking/confirm-pay',
      params: {
        ...params,
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
      },
    });
  };

  const renderGuestSelector = (
    label: string,
    subtitle: string,
    count: number,
    type: 'adults' | 'children' | 'infants',
  ) => {
    return (
      <View style={styles.guestSection}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestLabel}>{label}</Text>
          <Text style={styles.guestSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={[styles.quantityButton, count === 0 && styles.quantityButtonDisabled]}
            onPress={() => handleDecrement(type)}
            disabled={type === 'adults' && count === 1}>
            <Ionicons
              name="remove"
              size={20}
              color={count === 0 || (type === 'adults' && count === 1) ? BOOKING_COLORS.TEXT_SECONDARY : BOOKING_COLORS.PRIMARY}
            />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{count}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleIncrement(type)}>
            <Ionicons name="add" size={20} color={BOOKING_COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>
    );
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
            <Text style={styles.title}>Select Guest</Text>

            {renderGuestSelector('Adults', 'Ages 14 or above', adults, 'adults')}
            {renderGuestSelector('Children', 'Ages 2-13', children, 'children')}
            {renderGuestSelector('Infants', 'Under 2', infants, 'infants')}

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
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
  guestSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestInfo: {
    flex: 1,
  },
  guestLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  guestSubtitle: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    minWidth: 30,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});
