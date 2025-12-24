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
  segment_name?: string;  // Logical segment name (e.g., "Segment Puas - Pecinta Segmentation")
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

export interface FeatureExplanation {
  feature: string;
  importance: string;
  description: string;
}

export interface ExplainabilityData {
  top_features: FeatureExplanation[];
  average_satisfaction: number;
  sentiment_trend: string;
  respondent_count: number;
  segment_rationale?: string;
  recommendation_rationale?: string;
}

export interface SegmentInsight {
  segment_id: string;
  problem: string;
  cause: string;
  recommendation: string;
  summary: string;
  satisfaction_status: "high" | "medium" | "low";
  confidence?: number;
  confidence_label?: string;
  reason?: string;
  explainability?: ExplainabilityData;
  low_confidence_warning?: boolean;
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
  segment_insights?: SegmentInsight[];
  data_insufficient?: boolean;
  insufficient_message?: string;
}

export interface AIClassificationResponse {
  status: string;
  message: string;
  data: AIClassificationData;
}

