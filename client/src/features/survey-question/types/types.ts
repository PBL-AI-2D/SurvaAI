export type QuestionType =
  | 'pilihan_ganda'
  | 'checkbox'
  | 'dropdown'
  | 'skala'
  | 'essay';

export type VisualizationType =
  | 'pie'
  | 'bar'
  | 'line'
  | 'doughnut'
  | 'radar'
  | 'text'
  | 'wordcloud'
  | 'sentiment_analysis';

export interface SurveyQuestion {
  id: string
  id_survei: string
  teks_pertanyaan: string
  tipe_pertanyaan: QuestionType
  opsi?: string[]
  is_required: boolean
  tipe_visualisasi: VisualizationType
  index: number
}

export interface SurveyQuestionListResponse {
  status: string
  message: string
  data: SurveyQuestion[]
  meta: {
    total_items: number
    total_pages: number
    current_page: number
    per_page: number
  }
}

export interface CreateSurveyQuestionPayload {
  teks_pertanyaan: string
  opsi?: string[] | null
}

export interface UpdateSurveyQuestionPayload {
  teks_pertanyaan?: string
  tipe_pertanyaan?: QuestionType
  opsi?: string[] | null
  is_required?: boolean
  tipe_visualisasi?: VisualizationType
}

export interface UpdateVisualizationTypeSurveyQuestionPayload {
  tipe_visualisasi: VisualizationType
}
