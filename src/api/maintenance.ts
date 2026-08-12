import axiosInstance, { ApiResponse } from '../lib/axios';

// Types
export type MaintenanceType = 'maintenance' | 'repair';
export type MaintenanceStatus = 'open' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  _id: string;
  asset: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  vendor: string;
  cost: number;
  scheduledDate: string;
  startedDate: string;
  completedDate: string;
  resolvedNotes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceListParams {
  page?: number;
  limit?: number;
  asset?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
}

export interface CreateMaintenanceData {
  asset: string;
  type: MaintenanceType;
  description: string;
  vendor: string;
  cost: number;
  scheduledDate: string;
}

export interface CompleteMaintenanceData {
  resolvedNotes: string;
  cost?: number;
}

export interface CancelMaintenanceData {
  resolvedNotes: string;
}

export interface MaintenanceListResponse {
  records: MaintenanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const maintenanceApi = {
  getAll: async (params?: MaintenanceListParams): Promise<MaintenanceListResponse> => {
    const response: ApiResponse<MaintenanceListResponse> = await axiosInstance.get('/maintenance', { params });
    return response.data;
  },

  getById: async (id: string): Promise<MaintenanceRecord> => {
    const response: ApiResponse<MaintenanceRecord> = await axiosInstance.get(`/maintenance/${id}`);
    return response.data;
  },

  create: async (data: CreateMaintenanceData): Promise<MaintenanceRecord> => {
    const response: ApiResponse<MaintenanceRecord> = await axiosInstance.post('/maintenance', data);
    return response.data;
  },

  complete: async (id: string, data: CompleteMaintenanceData): Promise<MaintenanceRecord> => {
    const response: ApiResponse<MaintenanceRecord> = await axiosInstance.patch(`/maintenance/${id}/complete`, data);
    return response.data;
  },

  cancel: async (id: string, data: CancelMaintenanceData): Promise<MaintenanceRecord> => {
    const response: ApiResponse<MaintenanceRecord> = await axiosInstance.patch(`/maintenance/${id}/cancel`, data);
    return response.data;
  },

  getAssetHistory: async (assetId: string): Promise<MaintenanceRecord[]> => {
    const response: ApiResponse<MaintenanceRecord[]> = await axiosInstance.get(`/maintenance/asset/${assetId}/history`);
    return response.data;
  },
};
