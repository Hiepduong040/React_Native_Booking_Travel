import { API_CONFIG } from '../constants/api';
import { storageService } from './storage';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface ApiResponse {
  data?: any;
  status?: number;
  statusText?: string;
}

export const api = {
  get: async (url: string, config?: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(config && config.headers ? config.headers : {}),
      },
    });
    const data = await response.json();
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  },

  post: async (url: string, data?: any, config?: any): Promise<ApiResponse> => {
    try {
      const token = await storageService.getAccessToken();
      const headers: any = {
        'Content-Type': 'application/json',
        ...(config && config.headers ? config.headers : {}),
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      // Kiểm tra nếu response không phải JSON
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Server error');
      }
      
      // Nếu response không thành công, throw error với message từ backend
      if (!response.ok) {
        const error: any = new Error(responseData.message || 'Có lỗi xảy ra');
        error.data = responseData;
        error.status = response.status;
        throw error;
      }
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      // Xử lý lỗi network
      if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
        const networkError: any = new Error('Không thể kết nối đến server. Vui lòng kiểm tra: Backend đang chạy, IP address đúng, và Device và máy tính cùng mạng WiFi');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  put: async (url: string, data?: any, config?: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(config && config.headers ? config.headers : {}),
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
    };
  },

  delete: async (url: string, config?: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(config && config.headers ? config.headers : {}),
      },
    });
    const data = await response.json();
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  },
};

