import axiosInstance, { ApiResponse } from '../lib/axios';

// Types
export type AssetKind = 'hardware' | 'software_license';
export type AssetCategory = 'laptop' | 'desktop' | 'server' | 'networking_device' | 'mobile_device' | 'printer' | 'accessory' | 'software_license';
export type AssetStatus = 'available' | 'assigned' | 'under_maintenance' | 'in_repair' | 'retired' | 'disposed' | 'lost';
export type AssetCondition = 'new' | 'good' | 'fair' | 'damaged';

export interface Asset {
  id: string;
  assetTag: string;
  assetKind: AssetKind;
  category: AssetCategory;
  name: string;
  brand: string;
  modelName: string;
  status: AssetStatus;
  vendor: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiryDate: string;
  location: string;
  notes: string;
  attachments: any[];
  // Hardware-specific
  serialNumber?: string;
  condition?: AssetCondition;
  specifications?: Record<string, any>;
  // License-specific
  licenseKey?: string;
  totalSeats?: number;
  seatsAllocated?: number;
  expiryDate?: string;
  // Additional context
  currentAssignment?: any;
  activeSeats?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetsListParams {
  page?: number;
  limit?: number;
  category?: AssetCategory;
  status?: AssetStatus;
  search?: string;
}

export interface CreateHardwareAssetData {
  category: Exclude<AssetCategory, 'software_license'>;
  name: string;
  brand: string;
  modelName: string;
  vendor: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiryDate: string;
  location: string;
  notes: string;
  serialNumber: string;
  condition: AssetCondition;
  specifications: Record<string, any>;
}

export interface CreateLicenseAssetData {
  category: 'software_license';
  name: string;
  brand: string;
  vendor: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiryDate: string;
  location: string;
  notes: string;
  licenseKey: string;
  totalSeats: number;
  expiryDate: string;
}

export type CreateAssetData = CreateHardwareAssetData | CreateLicenseAssetData;

export interface UpdateAssetData {
  name?: string;
  brand?: string;
  modelName?: string;
  vendor?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiryDate?: string;
  location?: string;
  notes?: string;
  condition?: AssetCondition;
  specifications?: Record<string, any>;
}

export interface UpdateAssetStatusData {
  status: Exclude<AssetStatus, 'assigned'>;
  reason?: string;
}

export interface AssetsListResponse {
  assets: Asset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const assetsApi = {
  getAll: async (params?: AssetsListParams): Promise<AssetsListResponse> => {
    const response: ApiResponse<AssetsListResponse> = await axiosInstance.get('/assets', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Asset> => {
    const response: ApiResponse<Asset> = await axiosInstance.get(`/assets/${id}`);
    return response.data;
  },

  create: async (data: CreateAssetData): Promise<Asset> => {
    const response: ApiResponse<Asset> = await axiosInstance.post('/assets', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAssetData): Promise<Asset> => {
    const response: ApiResponse<Asset> = await axiosInstance.patch(`/assets/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateAssetStatusData): Promise<Asset> => {
    const response: ApiResponse<Asset> = await axiosInstance.patch(`/assets/${id}/status`, data);
    return response.data;
  },

  uploadAttachment: async (id: string, file: File): Promise<Asset> => {
    const formData = new FormData();
    formData.append('file', file);
    const response: ApiResponse<Asset> = await axiosInstance.post(`/assets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAttachment: async (id: string, fileKey: string): Promise<Asset> => {
    const response: ApiResponse<Asset> = await axiosInstance.delete(`/assets/${id}/attachments`, {
      params: { fileKey },
    });
    return response.data;
  },
};
