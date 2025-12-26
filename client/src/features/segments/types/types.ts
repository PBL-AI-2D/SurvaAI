export interface Segment {
  id: string;
  id_analisis?: string;
  id_survei?: string;
  model_versi?: string;
  cluster_label: string;
  karakteristik?: string;
  avg_sentiment?: number;
  avg_satisfaction?: number;
  segment_size: number;
  top_features?: Array<{
    feature: string;
    frequency?: number;
    importance?: number;
  }>;
  importance?: Record<string, number>;
  segment_rationale?: string;
  recommendation_rationale?: string;
  confidence_score?: number;
  confidence_label?: 'high' | 'medium' | 'low';
  low_confidence_warning?: boolean;
  respondent_ids?: string[];
  tanggal_analisis: string;
  created_at: string;
  AnalisisAi?: {
    id: string;
    tanggal_analisis: string;
  };
  Survei?: {
    id: string;
    judul: string;
  };
}

export interface SegmentDetail extends Segment {
  respondents?: Array<{
    id: string;
    is_completed: boolean;
    created_at: string;
    Umum?: {
      id: string;
      nama: string;
    };
  }>;
  respondent_count: number;
}

export interface SegmentComparison {
  segments: Array<{
    id: string;
    cluster_label: string;
    segment_size: number;
    avg_satisfaction: number;
    avg_sentiment: number;
    confidence_score: number;
    confidence_label: string;
    dominant_preference: string;
    top_features: Array<{
      feature: string;
      importance?: number;
    }>;
  }>;
  metrics: {
    total_respondents: number;
    avg_satisfaction_range: {
      min: number;
      max: number;
    };
    avg_confidence: number;
  };
}

export interface SegmentHistory {
  id: string;
  tanggal_analisis: string;
  segment_size: number;
  avg_satisfaction: number;
  avg_sentiment: number;
  confidence_score: number;
  top_features: Array<{
    feature: string;
    importance?: number;
  }>;
}

export interface SegmentListResponse {
  status: string;
  message: string;
  data: {
    data: Segment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CompareSegmentsPayload {
  segment_ids: string[];
}





