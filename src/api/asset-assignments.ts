import axiosInstance, { ApiResponse } from '../lib/axios';

// Types
export type AssignmentStatus = 'active' | 'returned' | 'lost' | 'revoked';
export type AssignmentAssetKind = 'hardware' | 'software_license';

export interface AssetAssignment {
  _id: string;
  asset: string;
  assetKind: AssignmentAssetKind;
  employee: string;
  assignedDate: string;
  assignedBy: string;
  remarks: string;
  // Hardware-specific
  status?: AssignmentStatus;
  expectedReturnDate?: string;
  returnedDate?: string;
  conditionAtAssignment?: string;
  conditionAtReturn?: string;
  returnedBy?: string;
  returnRemarks?: string;
  // License-specific
  revokedDate?: string;
  revokedBy?: string;
  revokeRemarks?: string;
}

export interface AssignmentsListParams {
  page?: number;
  limit?: number;
  asset?: string;
  employee?: string;
  assetKind?: AssignmentAssetKind;
  status?: AssignmentStatus;
}

export interface CreateAssignmentData {
  asset: string;
  employee: string;
  expectedReturnDate?: string;
  conditionAtAssignment?: string;
  remarks?: string;
}

export interface ReturnAssignmentData {
  conditionAtReturn: string;
  returnRemarks?: string;
}

export interface ReportLostData {
  remarks?: string;
}

export interface RevokeAssignmentData {
  revokeRemarks?: string;
}

export interface AssignmentsListResponse {
  assignments: AssetAssignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const assetAssignmentsApi = {
  getAll: async (params?: AssignmentsListParams): Promise<AssignmentsListResponse> => {
    const response: ApiResponse<AssignmentsListResponse> = await axiosInstance.get('/asset-assignments', { params });
    return response.data;
  },

  create: async (data: CreateAssignmentData): Promise<AssetAssignment> => {
    const response: ApiResponse<AssetAssignment> = await axiosInstance.post('/asset-assignments', data);
    return response.data;
  },

  return: async (id: string, data: ReturnAssignmentData): Promise<AssetAssignment> => {
    const response: ApiResponse<AssetAssignment> = await axiosInstance.patch(`/asset-assignments/${id}/return`, data);
    return response.data;
  },

  reportLost: async (id: string, data: ReportLostData): Promise<AssetAssignment> => {
    const response: ApiResponse<AssetAssignment> = await axiosInstance.patch(`/asset-assignments/${id}/report-lost`, data);
    return response.data;
  },

  revoke: async (id: string, data: RevokeAssignmentData): Promise<AssetAssignment> => {
    const response: ApiResponse<AssetAssignment> = await axiosInstance.patch(`/asset-assignments/${id}/revoke`, data);
    return response.data;
  },

  getAssetHistory: async (assetId: string): Promise<AssetAssignment[]> => {
    const response: ApiResponse<AssetAssignment[]> = await axiosInstance.get(`/asset-assignments/asset/${assetId}/history`);
    return response.data;
  },

  getEmployeeAssignments: async (employeeId: string): Promise<AssetAssignment[]> => {
    const response: ApiResponse<AssetAssignment[]> = await axiosInstance.get(`/asset-assignments/employee/${employeeId}`);
    return response.data;
  },
};
