import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminControlService } from '../api/user';
import { toast } from 'sonner';
import { ThresholdConfig } from '../types/types';

export const useSystemStatus = (enabled = true) => {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: () => adminControlService.getSystemStatus(),
    enabled,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useThresholdConfig = (enabled = true) => {
  return useQuery({
    queryKey: ['threshold-config'],
    queryFn: () => adminControlService.getThresholdConfig(),
    enabled,
  });
};

export const useTriggerAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminControlService.triggerAnalysis,
    onSuccess: (_, surveiId) => {
      queryClient.invalidateQueries({ queryKey: ['analysis-status', surveiId] });
      queryClient.invalidateQueries({ queryKey: ['analyses', surveiId] });
      toast.success('Analisis berhasil ditrigger');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal trigger analisis');
    },
  });
};

export const useResetAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminControlService.resetAnalysis,
    onSuccess: (_, surveiId) => {
      queryClient.invalidateQueries({ queryKey: ['analysis-status', surveiId] });
      queryClient.invalidateQueries({ queryKey: ['analyses', surveiId] });
      queryClient.invalidateQueries({ queryKey: ['segments', surveiId] });
      toast.success('Analisis berhasil direset');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal reset analisis');
    },
  });
};

export const useUpdateThresholdConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminControlService.updateThresholdConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threshold-config'] });
      toast.success('Konfigurasi threshold berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal memperbarui konfigurasi');
    },
  });
};

export const useClearCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminControlService.clearCache,
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Cache berhasil dibersihkan');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal membersihkan cache');
    },
  });
};






