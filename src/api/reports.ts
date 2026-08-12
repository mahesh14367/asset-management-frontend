import axiosInstance from '../lib/axios';

// Types
export type ReportType = 'asset_inventory' | 'asset_assignments' | 'maintenance_log' | 'employee_assets';
export type ReportFormat = 'csv' | 'xlsx' | 'pdf';

export interface DownloadReportParams {
  type: ReportType;
  format: ReportFormat;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export const reportsApi = {
  download: async (params: DownloadReportParams): Promise<Blob> => {
    const response = await axiosInstance.get('/reports/download', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
