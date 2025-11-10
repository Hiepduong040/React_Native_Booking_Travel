import { API_CONFIG } from '../constants/api';
import { storageService } from '../services/storage';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ReviewRequest {
  hotelId: number;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewResponse {
  reviewId: number;
  hotelId: number;
  hotelName: string;
  user: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  rating: number;
  comment?: string;
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
        errorMessage = errorData.message || (errorData.data && errorData.data.message) || errorMessage;
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

export const createReview = async (request: ReviewRequest): Promise<ReviewResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse(response);
    return data as ReviewResponse;
  } catch (error: any) {
    console.error('Error creating review:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const getReviewsByRoomId = async (roomId: number): Promise<ReviewResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/reviews/room/${roomId}`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const getReviewsByHotelId = async (hotelId: number): Promise<ReviewResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/reviews/hotel/${hotelId}`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};
