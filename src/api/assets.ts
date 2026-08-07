import axiosInstance from '../lib/axios';

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  location: string;
  purchaseDate: string;
  value: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetData {
  name: string;
  type: string;
  location: string;
  purchaseDate: string;
  value: number;
  description?: string;
}

export interface UpdateAssetData extends Partial<CreateAssetData> {
  status?: Asset['status'];
}

export interface AssetsResponse {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
}

export const assetsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<AssetsResponse> => {
    const response = await axiosInstance.get('/assets', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Asset> => {
    const response = await axiosInstance.get(`/assets/${id}`);
    return response.data;
  },

  create: async (data: CreateAssetData): Promise<Asset> => {
    const response = await axiosInstance.post('/assets', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAssetData): Promise<Asset> => {
    const response = await axiosInstance.put(`/assets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/assets/${id}`);
  },

  updateStatus: async (id: string, status: Asset['status']): Promise<Asset> => {
    const response = await axiosInstance.patch(`/assets/${id}/status`, { status });
    return response.data;
  },
};
