import axiosInstance, { ApiResponse } from '../lib/axios';
import { UserRole, User } from './auth';

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface UpdateRoleData {
  role: UserRole;
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response: ApiResponse<User> = await axiosInstance.patch('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await axiosInstance.patch('/users/me/password', data);
  },

  getAll: async (params?: UsersListParams): Promise<UsersListResponse> => {
    const response: ApiResponse<UsersListResponse> = await axiosInstance.get('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response: ApiResponse<User> = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  updateRole: async (id: string, data: UpdateRoleData): Promise<User> => {
    const response: ApiResponse<User> = await axiosInstance.patch(`/users/${id}/role`, data);
    return response.data;
  },
};
