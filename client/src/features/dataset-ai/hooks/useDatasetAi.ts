import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetAiService } from '../api/user';
import { toast } from 'sonner';

export const useDatasetAi = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['dataset-ai', params],
    queryFn: () => datasetAiService.getAll(params),
  });
};

export const useDatasetAiById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['dataset-ai', id],
    queryFn: () => datasetAiService.getById(id),
    enabled: enabled && !!id,
  });
};

export const useDatasetAiVersions = (namaDataset: string, enabled = true) => {
  return useQuery({
    queryKey: ['dataset-ai-versions', namaDataset],
    queryFn: () => datasetAiService.getVersions(namaDataset),
    enabled: enabled && !!namaDataset,
  });
};

export const useDatasetAiPreview = (id: string, limit = 10, enabled = true) => {
  return useQuery({
    queryKey: ['dataset-ai-preview', id, limit],
    queryFn: () => datasetAiService.getPreview(id, limit),
    enabled: enabled && !!id,
  });
};

export const useUploadDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: datasetAiService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataset-ai'] });
      toast.success('Dataset berhasil diupload');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal upload dataset');
    },
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: datasetAiService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataset-ai'] });
      toast.success('Dataset berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menghapus dataset');
    },
  });
};





