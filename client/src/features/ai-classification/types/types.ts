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

export interface IKGExplainability {
  respondent_index: number;
  ikg_value: number;
  label: "Puas" | "Netral" | "Tidak Puas";
  components_used: string[];
  component_scores: {
    likert?: number;
    sentiment?: number;
    preference?: number;
  };
  weights_applied: {
    likert: number;
    sentiment: number;
    preference: number;
  };
  base_weights: {
    likert: number;
    sentiment: number;
    preference: number;
  };
  adaptive_adjustment: string;
  explanation: string;
  reason: string;
  sentiment_confidence?: number;
  detected_language: string;
  details: {
    likert_details: string[];
    preference_details: string[];
  };
}

export interface WeightMetadata {
  method: "dynamic" | "default";
  likert_availability: string;
  sentiment_availability: string;
  preference_availability: string;
  avg_confidence: number;
  low_confidence_ratio: string;
}

export interface ValidationMetrics {
  mean_absolute_deviation: number;
  max_deviation?: number;
  min_deviation?: number;
  interpretation: string;
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
  // IKG Explainability & System Validity
  ikg_explainability?: IKGExplainability[];
  sentiment_confidence_scores?: number[];
  average_sentiment_confidence?: number;
  weight_metadata?: WeightMetadata;
  validation_metrics?: ValidationMetrics;
  combined_satisfaction_index?: number;
  combined_satisfaction_label?: "Puas" | "Netral" | "Tidak Puas";
  distribution_combined_satisfaction?: {
    puas: number;
    netral: number;
    tidak_puas: number;
  };
  // Raw IKG per respondent (0-100) exposed by backend for detailed views
  ikg_raw_scores?: SatisfactionScore[];
}

export interface AIClassificationResponse {
  status: string;
  message: string;
  data: AIClassificationData;
}

