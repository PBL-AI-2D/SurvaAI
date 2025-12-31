export interface ThresholdConfig {
  confidence_high: number;
  confidence_medium: number;
  confidence_low: number;
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
  satisfaction_high: number;
  satisfaction_medium: number;
  satisfaction_low: number;
  low_confidence_warning: number;
  minimum_respondents: number;
}

export interface SystemStatus {
  total_surveys: number;
  total_analyses: number;
  processing_analyses: number;
  error_analyses: number;
  cache_status: 'connected' | 'not_configured';
  timestamp: string;
}

export interface TriggerAnalysisResponse {
  analysis_id: string;
  message: string;
}

export interface ResetAnalysisResponse {
  message: string;
}

export interface ClearCacheResponse {
  message: string;
  cleared_count: number;
}






