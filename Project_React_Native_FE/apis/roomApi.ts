import { API_CONFIG } from '../constants/api';
import { storageService } from '../services/storage';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface HotelInfo {
  hotelId: number;
  hotelName: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface RoomResponse {
  roomId: number;
  hotel?: HotelInfo;
  roomType: string;
  price: number;
  capacity: number;
  description?: string;
  images?: string[];
  thumbnailImage?: string;
  // Helper fields for compatibility
  hotelId?: number;
  hotelName?: string;
  hotelCity?: string;
  hotelLocation?: string;
  imageUrls?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface RoomDetailResponse {
  roomId: number;
  hotel?: {
    hotelId: number;
    hotelName: string;
    address?: string;
    city?: string;
    country?: string;
    description?: string;
    images?: string[];
  };
  roomType: string;
  price: number;
  capacity: number;
  description?: string;
  images?: string[];
}

export interface RoomSearchRequest {
  keyword?: string;
  city?: string;
  country?: string;
  hotelId?: number;
  page?: number;
  size?: number;
}

export interface RoomFilterRequest {
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  sortBy?: 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface RoomListResponse {
  rooms: RoomResponse[];
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
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
    let errorDetails: any = null;
    
    try {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorDetails = errorData;
        errorMessage = errorData.message || (errorData.data && errorData.data.message) || errorData.error || errorMessage;
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          data: errorData,
        });
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
        console.error('API Error Response (non-JSON):', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          text: text,
        });
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = { data: errorDetails || { message: errorMessage } };
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
    console.error('Error parsing success response:', parseError);
    throw new Error('Không thể parse response từ server');
  }
};

// Helper function to map backend response to frontend format
const mapRoomResponse = (room: any): RoomResponse => {
  const mapped: RoomResponse = {
    roomId: room.roomId,
    roomType: room.roomType,
    price: typeof room.price === 'number' ? room.price : parseFloat(room.price || '0'),
    capacity: room.capacity,
    description: room.description,
    images: room.images || [],
    thumbnailImage: room.thumbnailImage || (room.images && room.images.length > 0 ? room.images[0] : undefined),
    hotel: room.hotel,
  };

  // Add compatibility fields
  if (room.hotel) {
    mapped.hotelId = room.hotel.hotelId;
    mapped.hotelName = room.hotel.hotelName;
    mapped.hotelCity = room.hotel.city;
    mapped.hotelLocation = room.hotel.address;
  }

  // Map images
  if (room.images && Array.isArray(room.images)) {
    mapped.imageUrls = room.images;
  }

  return mapped;
};

export const getAllRooms = async (): Promise<RoomResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/api/rooms/search`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    
    const data = await handleResponse(response);
    
    // Backend returns RoomListResponse with rooms array
    if (data && data.rooms && Array.isArray(data.rooms)) {
      return data.rooms.map(mapRoomResponse);
    }
    
    // Fallback: if data is array directly
    if (Array.isArray(data)) {
      return data.map(mapRoomResponse);
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching all rooms:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server. Vui lòng kiểm tra: Backend đang chạy, IP address đúng, và Device và máy tính cùng mạng WiFi');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const searchRooms = async (request: RoomSearchRequest): Promise<RoomListResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/rooms/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse(response);
    
    // Backend returns RoomListResponse
    if (data && data.rooms && Array.isArray(data.rooms)) {
      return {
        rooms: data.rooms.map(mapRoomResponse),
        page: data.page || 0,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || data.rooms.length,
        size: data.size || data.rooms.length,
        first: data.first !== undefined ? data.first : true,
        last: data.last !== undefined ? data.last : true,
      };
    }
    
    // Fallback
    const rooms = Array.isArray(data) ? data : [];
    return {
      rooms: rooms.map(mapRoomResponse),
      page: 0,
      totalPages: 1,
      totalElements: rooms.length,
      size: rooms.length,
      first: true,
      last: true,
    };
  } catch (error: any) {
    console.error('Error searching rooms:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const filterRooms = async (filterRequest: RoomFilterRequest): Promise<RoomListResponse> => {
  try {
    const headers = await getAuthHeaders();
    
    // Map frontend filter request to backend format
    const backendRequest: any = {
      city: filterRequest.city,
      country: filterRequest.country,
      minPrice: filterRequest.minPrice,
      maxPrice: filterRequest.maxPrice,
      minCapacity: filterRequest.capacity,
      maxCapacity: filterRequest.capacity,
      sortBy: filterRequest.sortBy === 'price' ? 'price' : filterRequest.sortBy === 'rating' ? 'rating' : 'price',
      sortDirection: filterRequest.sortOrder?.toUpperCase() || 'ASC',
    };
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/filter`, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendRequest),
    });
    
    const data = await handleResponse(response);
    
    // Backend returns RoomListResponse
    if (data && data.rooms && Array.isArray(data.rooms)) {
      return {
        rooms: data.rooms.map(mapRoomResponse),
        page: data.page || 0,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || data.rooms.length,
        size: data.size || data.rooms.length,
        first: data.first !== undefined ? data.first : true,
        last: data.last !== undefined ? data.last : true,
      };
    }
    
    // Fallback
    const rooms = Array.isArray(data) ? data : [];
    return {
      rooms: rooms.map(mapRoomResponse),
      page: 0,
      totalPages: 1,
      totalElements: rooms.length,
      size: rooms.length,
      first: true,
      last: true,
    };
  } catch (error: any) {
    console.error('Error filtering rooms:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

export const getRoomById = async (roomId: number): Promise<RoomDetailResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
      method: 'GET',
      headers,
    });
    
    const data = await handleResponse(response);
    
    // Backend returns RoomDetailResponse
    return data as RoomDetailResponse;
  } catch (error: any) {
    console.error('Error fetching room by ID:', error);
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      const networkError: any = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};
