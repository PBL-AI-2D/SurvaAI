import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisAiService } from '../api/user';
import { toast } from 'sonner';
import { UpdateAnalysisStatusPayload } from '../types/types';

export const useAnalysisStatus = (surveiId: string, enabled = true) => {
  return useQuery({
    queryKey: ['analysis-status', surveiId],
    queryFn: () => analysisAiService.getStatus(surveiId),
    enabled: enabled && !!surveiId,
    refetchInterval: (data) => {
      // Poll every 2 seconds if status is 'processing'
      return data?.data?.status === 'processing' ? 2000 : false;
    },
  });
};

export const useAnalysesBySurvey = (
  surveiId: string,
  params?: Record<string, any>,
  enabled = true
) => {
  return useQuery({
    queryKey: ['analyses', surveiId, params],
    queryFn: () => analysisAiService.getBySurvey(surveiId, params),
    enabled: enabled && !!surveiId,
  });
};

export const useAnalysisById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisAiService.getById(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateAnalysisStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAnalysisStatusPayload }) =>
      analysisAiService.updateStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['analysis', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['analysis-status'] });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      toast.success('Status analisis berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal memperbarui status');
    },
  });
};





