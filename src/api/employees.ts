import axiosInstance, { ApiResponse } from '../lib/axios';

// Types
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type EmploymentStatus = 'active' | 'on_leave' | 'resigned' | 'terminated';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  workLocation: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  dateOfJoining: string;
  dateOfLeaving: string;
  reportingManager: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeesListParams {
  page?: number;
  limit?: number;
  department?: string;
  employmentStatus?: EmploymentStatus;
  employmentType?: EmploymentType;
  search?: string;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  workLocation: string;
  employmentType: EmploymentType;
  dateOfJoining: string;
  reportingManager: string;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  workLocation?: string;
  employmentType?: EmploymentType;
  reportingManager?: string;
}

export interface UpdateEmploymentStatusData {
  employmentStatus: EmploymentStatus;
  dateOfLeaving?: string;
}

export interface GrantAccessData {
  email?: string;
  password: string;
  role?: 'super_admin' | 'asset_manager' | 'employee';
}

export interface EmployeesListResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const employeesApi = {
  getMyProfile: async (): Promise<Employee> => {
    const response: ApiResponse<Employee> = await axiosInstance.get('/employees/me');
    return response.data;
  },

  getAll: async (params?: EmployeesListParams): Promise<EmployeesListResponse> => {
    const response: ApiResponse<EmployeesListResponse> = await axiosInstance.get('/employees', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response: ApiResponse<Employee> = await axiosInstance.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeData): Promise<Employee> => {
    const response: ApiResponse<Employee> = await axiosInstance.post('/employees', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeData): Promise<Employee> => {
    const response: ApiResponse<Employee> = await axiosInstance.patch(`/employees/${id}`, data);
    return response.data;
  },

  updateEmploymentStatus: async (id: string, data: UpdateEmploymentStatusData): Promise<Employee> => {
    const response: ApiResponse<Employee> = await axiosInstance.patch(`/employees/${id}/employment-status`, data);
    return response.data;
  },

  grantAccess: async (id: string, data: GrantAccessData): Promise<any> => {
    const response: ApiResponse<any> = await axiosInstance.post(`/employees/${id}/grant-access`, data);
    return response.data;
  },

  revokeAccess: async (id: string): Promise<Employee> => {
    const response: ApiResponse<Employee> = await axiosInstance.post(`/employees/${id}/revoke-access`);
    return response.data;
  },
};
