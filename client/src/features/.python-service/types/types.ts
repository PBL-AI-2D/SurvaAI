export interface MultipleTextInput {
  texts: string[];
}

export interface SentimentResult {
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentSummaryResponse {
  summary: SentimentSummary;
}
