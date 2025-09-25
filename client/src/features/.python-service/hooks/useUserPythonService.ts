import { useQuery } from '@tanstack/react-query';
import { fetchSentimentSummary, fetchWordCloudImage } from '../api/user';

export const useSentimentSummary = (texts: string[], enabled = true) => {
  return useQuery({
    queryKey: ['sentiment-summary', texts],
    queryFn: () => fetchSentimentSummary({ texts }),
    enabled: enabled && texts.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useWordCloudImage = (texts: string[], enabled = true) => {
  return useQuery({
    queryKey: ['wordcloud-image', texts],
    queryFn: async () => {
      const blob = await fetchWordCloudImage(texts);
      return URL.createObjectURL(blob);
    },
    enabled: enabled && texts.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
