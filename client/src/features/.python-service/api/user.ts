import { pythonApi } from '@/lib/api';
import { SentimentSummaryResponse, MultipleTextInput } from '../types/types';

export const fetchSentimentSummary = async (payload: MultipleTextInput): Promise<SentimentSummaryResponse> => {
  const response = await pythonApi.post('/api/sentiment/summary', payload);
  return response.data.data;
};

export const fetchWordCloudImage = async (texts: string[]): Promise<Blob> => {
  const response = await pythonApi.post('/api/wordcloud/', { texts }, {
    responseType: 'blob',
  });
  return response.data;
};
