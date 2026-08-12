import axiosInstance, { ApiResponse } from '../lib/axios';

export interface DashboardStats {
  assets: {
    total: number;
    byStatus: {
      available: number;
      assigned: number;
      under_maintenance: number;
      in_repair: number;
      retired: number;
      disposed: number;
      lost: number;
    };
    hardware: number;
    softwareLicense: number;
  };
  employees: {
    total: number;
    active: number;
  };
  assignments: {
    activeHardware: number;
    activeLicenseSeats: number;
  };
  maintenance: {
    open: number;
  };
}

export interface DashboardChartsData {
  assetCategoryDistribution: any[];
  assignmentTrend: any[];
  maintenanceCostTrend: any[];
}

export interface DashboardKPIs {
  assetUtilizationRate: number;
  averageAssignmentDuration: number;
  maintenanceCostPerAsset: number;
  licenseUtilizationRate: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response: ApiResponse<DashboardStats> = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },

  getCharts: async (months?: number): Promise<DashboardChartsData> => {
    const response: ApiResponse<DashboardChartsData> = await axiosInstance.get('/dashboard/charts', {
      params: { months },
    });
    return response.data;
  },

  getKPIs: async (): Promise<DashboardKPIs> => {
    const response: ApiResponse<DashboardKPIs> = await axiosInstance.get('/dashboard/kpis');
    return response.data;
  },
};
