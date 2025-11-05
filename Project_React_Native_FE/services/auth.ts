import { api } from './api';

const API_BASE_URL = '/api/auth';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerificationRequest {
  email: string;
  otpCode: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      dateOfBirth: string;
      gender: string;
    };
  };
}

export const authService = {
  // Đăng ký
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${API_BASE_URL}/register`, data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Đăng nhập
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${API_BASE_URL}/login`, data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Xác minh OTP
  verifyOtp: async (data: OtpVerificationRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${API_BASE_URL}/verify-otp`, data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

