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
  room: {
    roomId: number;
    roomType: string;
    price: number;
    hotelName: string;
    hotelCity?: string;
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  createdAt: string;
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
    let errorMessage = 'Có lỗi xảy ra';
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
        } else {
          errorMessage = errorData.message || (errorData.data && errorData.data.message) || errorMessage;
        }
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  try {
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.data) {
        return data.data;
      }
      return data;
    }
    return await response.text();
  } catch (parseError) {
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

export const getUserBookings = async (): Promise<BookingResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data;
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
