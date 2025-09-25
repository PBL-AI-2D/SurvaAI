import { api } from '@/lib/api'
import {
  AdminSurveyPayment,
  AdminSurveyPaymentListResponse,
} from '../types/types'

export const surveyPaymentAdminService = {
  getAll: async (params?: Record<string, any>): Promise<AdminSurveyPaymentListResponse> => {
    const response = await api.get('/api/pembayaran-survei', { params })
    return response.data
  },

  getById: async (id: string): Promise<AdminSurveyPayment> => {
    const response = await api.get(`/api/pembayaran-survei/${id}`)
    return response.data.data
  },

  delete: async (id: string): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/api/pembayaran-survei/${id}`)
    return response.data
  },
}
