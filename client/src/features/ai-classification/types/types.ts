export interface AIClassificationRequest {
  survey_id: string;
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
}

export interface SatisfactionPercentage {
  satisfied: number;
  neutral: number;
  unsatisfied: number;
}

export interface CustomerSegment {
  segment_id: number;
  respondent_count: number;
  satisfaction_percentage: number;
  satisfaction_status: "high" | "medium" | "low";
  dominant_preference?: string;
  all_preferences?: string[];
  satisfaction_range?: string;
  avg_age?: number;
}

export interface SatisfactionScore {
  index: number;
  score: number;
}

export interface PCAPoint {
  x: number;
  y: number;
  cluster: number;
}

export interface AIClassificationData {
  total_respondents: number;
  satisfaction_percentage: SatisfactionPercentage;
  average_satisfaction: number;
  sentiment_distribution: SentimentDistribution;
  satisfaction_scores: SatisfactionScore[];
  segments: CustomerSegment[];
  pca_2d?: PCAPoint[];
  preferences?: Record<string, number>;
  correlations: Record<string, Record<string, number>>;
  major_preference?: {
    name: string;
    percentage: number;
  };
  text_responses?: string[];
  total_text_responses?: number;
}

export interface AIClassificationResponse {
  status: string;
  message: string;
  data: AIClassificationData;
}

