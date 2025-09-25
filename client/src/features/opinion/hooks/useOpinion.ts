import { useMutation } from '@tanstack/react-query';
import { opinionService } from '../api/public';
import { OpinionPayload } from '../types/types';

export const useSendOpinion = () => {
  return useMutation({
    mutationFn: (payload: OpinionPayload) => opinionService.sendOpinion(payload),
  });
}
