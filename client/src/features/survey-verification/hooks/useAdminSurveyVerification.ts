import { useMutation, useQueryClient } from "@tanstack/react-query"
import { surveiVerificationAPI } from "../api/admin"
import { VerifySurveyPayload } from "../types/types"

export const useSubmitSurveiForVerification = () => {
  return useMutation({
    mutationFn: (id: string) => surveiVerificationAPI.submit(id),
  })
}

export const useVerifySurveiByAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: VerifySurveyPayload
    }) => surveiVerificationAPI.verify(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-surveys', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-survey', id] });
    }
  })
}
