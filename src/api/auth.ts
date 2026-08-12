import axiosInstance, { ApiResponse } from '../lib/axios';

// Types
export type UserRole = 'super_admin' | 'asset_manager' | 'employee';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response: ApiResponse<LoginResponse> = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response: ApiResponse<{ accessToken: string }> = await axiosInstance.post('/auth/refresh-token');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    await axiosInstance.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', data);
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const response: ApiResponse<User> = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
