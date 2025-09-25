import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getKonfigurasiHarga,
  createKonfigurasiHarga,
  updateKonfigurasiHarga,
} from '../api/admin'
import { CreateKonfigurasiHargaPayload, UpdateKonfigurasiHargaPayload } from '../types/types'

export const useKonfigurasiHarga = (enabled = true) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['konfigurasi-harga'],
    queryFn: getKonfigurasiHarga,
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })

  return {
    config: data?.data || null,
    status: data?.status,
    message: data?.message,
    isLoading,
    isFetching,
    isError,
    error,
    errorMessage: error?.message || data?.message,
    refetch,
  }
}

export const useCreateKonfigurasiHarga = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateKonfigurasiHargaPayload) =>
      createKonfigurasiHarga(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konfigurasi-harga'] })
    },
  })
}

export const useUpdateKonfigurasiHarga = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateKonfigurasiHargaPayload) =>
      updateKonfigurasiHarga(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konfigurasi-harga'] })
    },
  })
}
