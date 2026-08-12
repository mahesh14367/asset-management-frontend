import axiosInstance, { ApiResponse } from '../lib/axios';

export interface UploadFileResponse {
  fileKey: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const filesApi = {
  upload: async (file: File, folder?: string): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response: ApiResponse<UploadFileResponse> = await axiosInstance.post('/files/upload', formData, {
      params: { folder },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (fileKey: string): Promise<void> => {
    await axiosInstance.delete('/files', { params: { fileKey } });
  },

  getSignedUrl: async (fileKey: string): Promise<{ url: string }> => {
    const response: ApiResponse<{ url: string }> = await axiosInstance.get('/files/signed-url', {
      params: { fileKey },
    });
    return response.data;
  },
};
