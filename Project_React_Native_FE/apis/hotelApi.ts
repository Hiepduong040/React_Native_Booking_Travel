import { API_CONFIG } from '../constants/api';
import { storageService } from '../services/storage';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface HotelResponse {
  hotelId: number;
  hotelName: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  images?: string[];
  thumbnailImage?: string;
  roomCount?: number;
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

export const getAllHotels = async (): Promise<HotelResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/hotels`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

