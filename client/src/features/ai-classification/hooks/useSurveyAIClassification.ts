import { useQuery } from "@tanstack/react-query";
import { aiClassificationService } from "../api/user";
import { adminResponSurveiService } from "../api/admin";
import { AIClassificationData } from "../types/types";

export const useSurveyAIClassification = (
  surveyId: string,
  enabled: boolean = true
) => {
  return useQuery<AIClassificationData>({
    queryKey: ["ai-classification", surveyId],
    queryFn: async () => {
      // First, fetch all survey responses
      let allResponses: any[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      // Fetch all pages of responses using admin endpoint (only completed responses)
      while (hasMore) {
        const responsesData = await adminResponSurveiService.getBySurveyId(surveyId, {
          page,
          limit,
          is_completed: true, // Only fetch completed responses
        });

        const responses = responsesData.data || [];
        allResponses = [...allResponses, ...responses];

        hasMore = responses.length === limit && page * limit < (responsesData.meta?.total_items || 0);
        page++;
      }

      if (allResponses.length === 0) {
        throw new Error("No completed responses found for this survey");
      }

      // Fetch detailed response data with questions (limit to first 100 for performance)
      const responsesToProcess = allResponses.slice(0, 100);
      const detailedResponses = await Promise.all(
        responsesToProcess.map((response) =>
          adminResponSurveiService.getById(response.id).catch((err) => {
            console.error(`Error fetching response ${response.id}:`, err);
            return null;
          })
        )
      );

      const validResponses = detailedResponses.filter((r) => r !== null) as any[];

      if (validResponses.length === 0) {
        throw new Error("No valid responses found for analysis");
      }

      // Classify using AI
      const classificationResult = await aiClassificationService.classifySurvey(
        surveyId,
        validResponses
      );

      // Transform Python service response to our format
      const pythonData = classificationResult.data;
      
      // Safe access to sentiment_distribution with fallback
      // Prioritize sentiment_distribution from satisfaction_overview
      let sentimentDist = pythonData.satisfaction_overview?.sentiment_distribution;
      
      // If sentiment_distribution is missing or invalid, try to derive from satisfaction_percentage
      if (!sentimentDist || (typeof sentimentDist !== 'object')) {
        const satisfactionPct = pythonData.ai_insight_summary?.satisfaction_percentage;
        if (satisfactionPct && typeof satisfactionPct === 'object') {
          // Convert percentage to counts (approximate)
          const total = pythonData.satisfaction_overview?.total_respondents || 
                       pythonData.analytics_overview?.total_respondents || 0;
          sentimentDist = {
            positive: Math.round((satisfactionPct.satisfied || 0) * total / 100),
            negative: Math.round((satisfactionPct.unsatisfied || 0) * total / 100),
            neutral: Math.round((satisfactionPct.neutral || 0) * total / 100),
          };
        } else {
          // Final fallback: use satisfaction scores to derive sentiment
          const satisfactionScores = pythonData.chart_data?.satisfaction_scores || [];
          if (satisfactionScores.length > 0) {
            let positive = 0, negative = 0, neutral = 0;
            satisfactionScores.forEach((score: number) => {
              if (score > 0.7) positive++;
              else if (score < 0.3) negative++;
              else neutral++;
            });
            sentimentDist = { positive, negative, neutral };
          } else {
            sentimentDist = { positive: 0, negative: 0, neutral: 0 };
          }
        }
      }
      
      // Ensure sentiment_distribution always has valid structure
      const sentimentDistribution = {
        positive: Number(sentimentDist.positive) || 0,
        negative: Number(sentimentDist.negative) || 0,
        neutral: Number(sentimentDist.neutral) || 0,
      };
      
      return {
        total_respondents: pythonData.satisfaction_overview?.total_respondents || pythonData.analytics_overview?.total_respondents || 0,
        satisfaction_percentage: {
          satisfied: pythonData.ai_insight_summary?.satisfaction_percentage?.satisfied || 0,
          neutral: pythonData.ai_insight_summary?.satisfaction_percentage?.neutral || 0,
          unsatisfied: pythonData.ai_insight_summary?.satisfaction_percentage?.unsatisfied || 0,
        },
        average_satisfaction: (pythonData.satisfaction_overview?.avg_satisfaction_10 || pythonData.analytics_overview?.avg_satisfaction_10 || 0) / 10, // Convert from 0-10 to 0-1
        sentiment_distribution: sentimentDistribution,
        satisfaction_scores: (pythonData.chart_data?.satisfaction_scores || []).map((score, idx) => ({
          index: idx + 1,
          score: score * 100, // Convert to percentage
        })),
        segments: (pythonData.segmentation?.segment_details || []).map((segment) => ({
          segment_id: segment.segment_id,
          respondent_count: segment.respondent_count,
          satisfaction_percentage: segment.satisfaction_percentage,
          satisfaction_status: segment.satisfaction_status,
          dominant_preference: segment.dominant_preference,
          avg_age: segment.avg_age,
        })),
        correlations: pythonData.chart_data?.likert_correlation || {},
        major_preference: pythonData.ai_insight_summary?.major_preference
          ? {
              name: pythonData.ai_insight_summary.major_preference.name,
              percentage: pythonData.ai_insight_summary.major_preference.percentage,
            }
          : undefined,
        text_responses: pythonData.text_analysis?.all_text_responses || [],
        total_text_responses: pythonData.text_analysis?.total_text_responses || 0,
      };
    },
    enabled: enabled && !!surveyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

