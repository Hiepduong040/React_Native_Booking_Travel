import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { BOOKING_COLORS, Hotel } from '@/constants/booking';

interface HotelCardProps {
  hotel: Hotel;
  variant?: 'vertical' | 'horizontal';
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  variant = 'vertical',
  onPress,
  onFavoritePress,
}) => {
  // Extract hotel data with fallbacks
  const hotelName = hotel.name || hotel.hotelName || 'Unknown Hotel';
  const hotelLocation = hotel.location || hotel.city || hotel.address || 'Location unknown';
  const hotelPrice = hotel.price || 0;
  const hotelRating = hotel.rating || 0;
  const hotelReviewCount = hotel.reviewCount || 0;
  const hotelImageUrl = hotel.imageUrl || (hotel.images && hotel.images.length > 0 ? hotel.images[0] : '');
  const isFavorite = hotel.isFavorite || false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={onPress}
        activeOpacity={0.8}>
        <ExpoImage
          source={{
            uri: hotelImageUrl || 'https://via.placeholder.com/120x120?text=No+Image',
          }}
          style={styles.horizontalImage}
          contentFit="cover"
        />
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalHeader}>
            <Text style={styles.horizontalTitle} numberOfLines={1}>
              {hotelName}
            </Text>
            {onFavoritePress && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onFavoritePress();
                }}
                style={styles.favoriteButton}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? BOOKING_COLORS.HEART : BOOKING_COLORS.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.locationText} numberOfLines={1}>
              {hotelLocation}
            </Text>
          </View>
          {hotelRating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={BOOKING_COLORS.RATING} />
              <Text style={styles.ratingText}>
                {hotelRating.toFixed(1)} ({hotelReviewCount})
              </Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatPrice(hotelPrice)}</Text>
            <Text style={styles.priceUnit}>/đêm</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical variant (default)
  return (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <ExpoImage
          source={{
            uri: hotelImageUrl || 'https://via.placeholder.com/400x200?text=No+Image',
          }}
          style={styles.verticalImage}
          contentFit="cover"
        />
        {onFavoritePress && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
            style={styles.favoriteButtonOverlay}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? BOOKING_COLORS.HEART : BOOKING_COLORS.BACKGROUND}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {hotelName}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={BOOKING_COLORS.TEXT_SECONDARY} />
          <Text style={styles.locationText} numberOfLines={1}>
            {hotelLocation}
          </Text>
        </View>
        {hotelRating > 0 && (
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(hotelRating) ? 'star' : 'star-outline'}
                size={12}
                color={BOOKING_COLORS.RATING}
              />
            ))}
            <Text style={styles.ratingText}>
              {hotelRating.toFixed(1)} ({hotelReviewCount} đánh giá)
            </Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{formatPrice(hotelPrice)}</Text>
          <Text style={styles.priceUnit}>/đêm</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical Card Styles
  verticalCard: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  verticalImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRICE,
  },
  priceUnit: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },

  // Horizontal Card Styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    padding: 8,
  },
  horizontalImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  horizontalContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
  },
  horizontalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

