import { api } from '@/lib/api';
import {
  DatasetAi,
  DatasetListResponse,
  UploadDatasetPayload,
  DatasetPreviewResponse,
} from '../types/types';

export const datasetAiService = {
  getAll: async (params?: Record<string, any>): Promise<DatasetListResponse> => {
    const response = await api.get('/api/ai/datasets', { params });
    return response.data;
  },

  getById: async (id: string): Promise<DatasetAi> => {
    const response = await api.get(`/api/ai/datasets/${id}`);
    return response.data.data;
  },

  upload: async (payload: UploadDatasetPayload): Promise<DatasetAi> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.nama_dataset) {
      formData.append('nama_dataset', payload.nama_dataset);
    }
    if (payload.sumber) {
      formData.append('sumber', payload.sumber);
    }
    if (payload.id_survei) {
      formData.append('id_survei', payload.id_survei);
    }

    const response = await api.post('/api/ai/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getVersions: async (namaDataset: string): Promise<DatasetAi[]> => {
    const response = await api.get(`/api/ai/datasets/versions/${encodeURIComponent(namaDataset)}`);
    return response.data.data;
  },

  getPreview: async (id: string, limit = 10): Promise<DatasetPreviewResponse> => {
    const response = await api.get(`/api/ai/datasets/${id}/preview`, {
      params: { limit },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/ai/datasets/${id}`);
  },
};






