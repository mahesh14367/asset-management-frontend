import axiosInstance, { ApiResponse } from '../lib/axios';

// Types
export type AuditAction = 
  | 'USER_REGISTERED'
  | 'USER_LOGIN_SUCCESS'
  | 'USER_LOGIN_FAILED'
  | 'USER_LOGOUT'
  | 'USER_PASSWORD_CHANGED'
  | 'USER_CREATED_BY_ADMIN'
  | 'USER_PROFILE_UPDATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_STATUS_CHANGED'
  | 'USER_LOGGED_IN'
  | 'USER_PASSWORD_RESET'
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_STATUS_CHANGED'
  | 'USER_ACCESS_GRANTED'
  | 'USER_ACCESS_REVOKED'
  | 'ASSET_CREATED'
  | 'ASSET_UPDATED'
  | 'ASSET_STATUS_CHANGED'
  | 'ASSET_ASSIGNED'
  | 'ASSET_RETURNED'
  | 'LICENSE_SEAT_ALLOCATED'
  | 'LICENSE_SEAT_REVOKED'
  | 'MAINTENANCE_STARTED'
  | 'MAINTENANCE_COMPLETED'
  | 'MAINTENANCE_CANCELLED'
  | 'REPORT_DOWNLOADED';

export type AuditStatus = 'SUCCESS' | 'FAILURE';

export interface AuditActor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuditMetadata {
  ipAddress: string;
  userAgent: string;
}

export interface AuditChanges {
  before?: Record<string, any>;
  after?: Record<string, any>;
}

export interface AuditLog {
  _id: string;
  actor: AuditActor;
  action: AuditAction;
  status: AuditStatus;
  entityType: string;
  entityId: string;
  description: string;
  changes?: AuditChanges;
  metadata?: AuditMetadata;
  createdAt: string;
}

export interface AuditLogsListParams {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  status?: AuditStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogsListResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditLogsApi = {
  getAll: async (params?: AuditLogsListParams): Promise<AuditLogsListResponse> => {
    const response: ApiResponse<AuditLogsListResponse> = await axiosInstance.get('/audit-logs', { params });
    return response.data;
  },

  getEntityHistory: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response: ApiResponse<AuditLog[]> = await axiosInstance.get(`/audit-logs/${entityType}/${entityId}`);
    return response.data;
  },
};
