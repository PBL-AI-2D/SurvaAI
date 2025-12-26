export interface AnalisisAi {
  id: string;
  id_respon?: string;
  id_survei?: string;
  id_dataset?: string;
  id_performa?: string;
  model_name?: string;
  jenis_analisis?: string;
  confidence_score?: number;
  sentiment_score?: number;
  satisfaction_score?: number;
  preference_score?: number;
  predicted_label?: string;
  processing_status: 'idle' | 'processing' | 'done' | 'error';
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_duration?: number;
  error_message?: string;
  tanggal_analisis: string;
  created_at: string;
  ResponSurvei?: {
    id: string;
    is_completed: boolean;
  };
  Survei?: {
    id: string;
    judul: string;
  };
  DatasetAi?: {
    id: string;
    nama_dataset: string;
    versi: number;
  };
  PerformaModel?: {
    id: string;
    nama_model: string;
    akurasi: number;
  };
}

export interface AnalysisStatus {
  status: 'idle' | 'processing' | 'done' | 'error';
  last_analysis_at: string | null;
  processing_duration: number | null;
  error_message: string | null;
  analysis_id?: string;
}

export interface AnalysisListResponse {
  status: string;
  message: string;
  data: {
    data: AnalisisAi[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UpdateAnalysisStatusPayload {
  status: 'idle' | 'processing' | 'done' | 'error';
  error_message?: string;
}





