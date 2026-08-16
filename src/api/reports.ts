import axios from 'axios';
import { getAccessToken } from '../lib/axios';

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
    const token = getAccessToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/download`, {
      params,
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};
