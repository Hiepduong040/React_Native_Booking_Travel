import { API_CONFIG } from '../constants/api';
import { storageService } from '../services/storage';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface BookingRequest {
  roomId: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
}

export interface PaymentRequest {
  bookingId: number;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string; // MM/YY
  cvv: string;
  paymentMethod?: string;
}

export interface BookingResponse {
  bookingId: number;
  roomId?: number;
  room?: {
    roomId: number;
    roomType: string;
    price: number;
    hotelId?: number;
    hotelName: string;
    hotelCity?: string;
    hotelAddress?: string;
    roomImageUrl?: string | null;
  };
  roomType?: string;
  roomImageUrl?: string | null;
  hotelId?: number;
  hotelName?: string;
  hotelLocation?: string;
  hotelCity?: string;
  hotelAddress?: string;
  checkIn: string | number[];
  checkOut: string | number[];
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  createdAt: string | number[];
  rating?: number;
  reviewCount?: number;
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await storageService.getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    try {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        
        // Handle validation errors from GlobalExceptionHandler
        if (errorData.data && typeof errorData.data === 'object' && !Array.isArray(errorData.data)) {
          // This is a validation error map
          const validationErrors = Object.entries(errorData.data)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = validationErrors || errorData.message || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
    } catch (parseError) {
      // If we can't parse the error, use status code
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
      console.error('Error parsing error response:', parseError);
    }
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  try {
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      // Handle different response formats
      if (data.data !== undefined) {
        return data.data;
      }
      if (data.content !== undefined) {
        return data.content;
      }
      return data;
    }
    const text = await response.text();
    return text || null;
  } catch (parseError) {
    console.error('Error parsing success response:', parseError);
    // Return empty array for booking endpoints if parse fails
    if (response.url.includes('/bookings')) {
      return [];
    }
    throw new Error('Không thể parse response từ server');
  }
};

export const createBooking = async (request: BookingRequest): Promise<BookingResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse(response);
    return data as BookingResponse;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const processPayment = async (request: PaymentRequest): Promise<BookingResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse(response);
    return data as BookingResponse;
  } catch (error: any) {
    console.error('Error processing payment:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

// Helper function to normalize booking response (map nested to flat structure)
const normalizeBookingResponse = (booking: any): BookingResponse => {
  if (!booking) {
    return booking;
  }
  
  // Map from nested structure to flat structure for frontend compatibility
  const normalized: BookingResponse = {
    bookingId: booking.bookingId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    totalPrice: booking.totalPrice,
    status: booking.status,
    adultsCount: booking.adultsCount || 0,
    childrenCount: booking.childrenCount || 0,
    infantsCount: booking.infantsCount || 0,
    createdAt: booking.createdAt,
    rating: booking.rating,
    reviewCount: booking.reviewCount,
  };
  
  // Priority: use nested room info if available, otherwise use flat fields
  if (booking.room) {
    normalized.roomId = booking.room.roomId;
    normalized.roomType = booking.room.roomType;
    normalized.hotelId = booking.room.hotelId;
    normalized.hotelName = booking.room.hotelName;
    normalized.hotelCity = booking.room.hotelCity;
    normalized.hotelAddress = booking.room.hotelAddress;
    normalized.roomImageUrl = booking.room.roomImageUrl;
    normalized.room = booking.room;
  }
  
  // Also set flat fields if they exist (for backward compatibility)
  if (booking.roomId) normalized.roomId = booking.roomId;
  if (booking.roomType) normalized.roomType = booking.roomType;
  if (booking.hotelId) normalized.hotelId = booking.hotelId;
  if (booking.hotelName) normalized.hotelName = booking.hotelName;
  if (booking.hotelCity) normalized.hotelCity = booking.hotelCity;
  if (booking.hotelAddress) normalized.hotelAddress = booking.hotelAddress;
  if (booking.hotelLocation) normalized.hotelLocation = booking.hotelLocation;
  if (booking.roomImageUrl) normalized.roomImageUrl = booking.roomImageUrl;
  
  return normalized;
};

export const getUserBookings = async (): Promise<BookingResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data.map(normalizeBookingResponse);
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const getRoomsByBookingStatus = async (status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<any[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/rooms/by-status?status=${status}`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching rooms by booking status:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const getUpcomingBookings = async (): Promise<BookingResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/upcoming`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data.map(normalizeBookingResponse);
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching upcoming bookings:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const getPastBookings = async (): Promise<BookingResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/past`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data.map(normalizeBookingResponse);
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching past bookings:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const cancelBooking = async (bookingId: number): Promise<BookingResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers,
    });
    
    const data = await handleResponse(response);
    return normalizeBookingResponse(data);
  } catch (error: any) {
    console.error('Error canceling booking:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const getBookingById = async (bookingId: number): Promise<BookingResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    return normalizeBookingResponse(data);
  } catch (error: any) {
    console.error('Error fetching booking by ID:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};
