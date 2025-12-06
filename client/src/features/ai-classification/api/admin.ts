import { api } from "@/lib/api";
import { ResponSurvei } from "@/features/survey-response-result/types/types";

export interface AdminResponSurveiResponse {
  status: string;
  message: string;
  data: ResponSurvei[];
  meta?: {
    total_items: number;
    total_pages: number;
    current_page: number;
    limit: number;
  };
}

export const adminResponSurveiService = {
  getBySurveyId: async (
    surveiId: string,
    params?: Record<string, any>
  ): Promise<AdminResponSurveiResponse> => {
    const response = await api.get(`/api/survei/${surveiId}/respon-survei`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<ResponSurvei> => {
    const response = await api.get(`/api/respon-survei/${id}`);
    return response.data.data;
  },
};

