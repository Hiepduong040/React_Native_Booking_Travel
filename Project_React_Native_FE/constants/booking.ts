/**
 * Booking colors and constants
 * Used throughout the booking flow screens
 */

export const BOOKING_COLORS = {
  PRIMARY: '#6C63FF',
  BACKGROUND: '#FFFFFF',
  CARD_BACKGROUND: '#F8F9FA',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#666666',
  BORDER: '#E0E0E0',
  RATING: '#FFB800',
  HEART: '#FF3B30',
  PRICE: '#6C63FF',
};

export interface Hotel {
  hotelId?: number;
  hotelName?: string;
  id?: string; // For UI mapping from RoomResponse
  name?: string; // For UI mapping from RoomResponse
  address?: string;
  city?: string;
  country?: string;
  location?: string; // For UI display
  description?: string;
  images?: string[];
  imageUrl?: string; // For UI display
  rating?: number;
  reviewCount?: number;
  price?: number;
  isFavorite?: boolean; // For favorite functionality
}

