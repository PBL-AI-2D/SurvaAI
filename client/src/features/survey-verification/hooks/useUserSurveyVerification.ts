import { useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyVerificationAPI } from '../api/user';
import { toast } from 'sonner';

export const useUserSubmitSurveyVerification = (id:string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: surveyVerificationAPI.submit,
    onSuccess: () => {
      toast.success('Survei berhasil diajukan untuk verifikasi.');
      queryClient.invalidateQueries({ queryKey: ['user-survey', id] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Gagal mengajukan survei.';
      toast.error(message);
    },
  });
};
