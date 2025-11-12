import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { BOOKING_COLORS, Hotel } from '../../constants/booking';
import { RoomResponse } from '../../apis/roomApi';

interface HotelCardProps {
  hotel: Hotel | RoomResponse;
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
  // Extract hotel data with fallbacks - support both Hotel and RoomResponse
  const isRoomResponse = 'roomId' in hotel;
  const hotelName = isRoomResponse 
    ? (hotel.hotelName || hotel.hotel?.hotelName || hotel.roomType || 'Unknown Hotel')
    : (hotel.name || 'Unknown Hotel');
  const roomType = isRoomResponse ? (hotel.roomType || 'Room') : undefined;
  const hotelLocation = isRoomResponse
    ? (hotel.hotelLocation || hotel.hotelCity || hotel.hotel?.city || hotel.hotel?.address || 'Location unknown')
    : (hotel.location || 'Location unknown');
  const hotelPrice = hotel.price || 0;
  const hotelRating = (hotel as any).rating || 0;
  const hotelReviewCount = (hotel as any).reviewCount || 0;
  const hotelImageUrl = isRoomResponse
    ? (hotel.imageUrls?.[0] || hotel.images?.[0] || hotel.thumbnailImage || '')
    : ((hotel as Hotel).imageUrl || '');
  const isFavorite = (hotel as any).isFavorite || false;

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
          transition={200}
        />
        {onFavoritePress && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
            style={styles.favoriteButtonOverlay}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? BOOKING_COLORS.HEART : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
        {hotelRating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={BOOKING_COLORS.RATING} />
            <Text style={styles.ratingText}>{(hotelRating || 0).toFixed(1)}</Text>
          </View>
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
        <View style={styles.footer}>
          <Text style={styles.reviews}>
            ({hotelReviewCount} {hotelReviewCount === 1 ? 'Review' : 'Reviews'})
          </Text>
          {hotelPrice > 0 ? (
            <Text style={styles.price}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(hotelPrice)}/night
            </Text>
          ) : (
            <Text style={styles.pricePlaceholder}>Liên hệ</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical Card Styles
  verticalCard: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  verticalImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 6,
    letterSpacing: -0.3,
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
  ratingBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  reviews: {
    fontSize: 13,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    fontWeight: '400',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRICE,
    letterSpacing: -0.3,
  },
  pricePlaceholder: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
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

