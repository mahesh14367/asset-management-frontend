import axiosInstance from '../lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: User['role'];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: User['role'];
  status?: User['status'];
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export const usersApi = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<UsersResponse> => {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  updateStatus: async (id: string, status: User['status']): Promise<User> => {
    const response = await axiosInstance.patch(`/users/${id}/status`, { status });
    return response.data;
  },
};
