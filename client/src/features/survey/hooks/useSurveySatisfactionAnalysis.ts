import { useQuery } from "@tanstack/react-query";
import { aiClassificationService } from "@/features/ai-classification/api/user";
import { responSurveiService } from "@/features/survey-response-result/api/user";
import { AIClassificationData } from "@/features/ai-classification/types/types";
import { filterValidResponses } from "../utils/preprocessing";

/**
 * Hook untuk analisis kepuasan survey menggunakan user endpoint
 * Menggunakan responses dari user's own survey
 */
export const useSurveySatisfactionAnalysis = (
  surveyId: string,
  enabled: boolean = true
) => {
  return useQuery<AIClassificationData>({
    queryKey: ["survey-satisfaction-analysis", surveyId],
    queryFn: async () => {
      // Fetch all survey responses menggunakan user endpoint
      let allResponses: any[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      // Fetch all pages of responses
      while (hasMore) {
        const responsesData = await responSurveiService.getAll(surveyId, {
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
      // Note: getAll() doesn't include PertanyaanSurveis, so we need to fetch details
      const responsesToProcess = allResponses.slice(0, 100);
      const detailedResponses = await Promise.all(
        responsesToProcess.map((response) =>
          responSurveiService.getById(surveyId, response.id).catch((err) => {
            console.error(`Error fetching response ${response.id}:`, err);
            return null;
          })
        )
      );

      // Filter out null responses
      const nonNullResponses = detailedResponses.filter((r) => r !== null) as any[];
      
      if (nonNullResponses.length === 0) {
        throw new Error("Failed to fetch detailed response data. Please try again.");
      }

      // Filter valid responses after fetching details (now they should have PertanyaanSurveis)
      const validDetailedResponses = filterValidResponses(nonNullResponses);

      if (validDetailedResponses.length === 0) {
        // Log untuk debugging
        console.warn("No valid responses after filtering:", {
          totalFetched: nonNullResponses.length,
          sampleResponse: nonNullResponses[0] ? {
            id: nonNullResponses[0].id,
            is_completed: nonNullResponses[0].is_completed,
            hasPertanyaanSurveis: !!nonNullResponses[0].Survei?.PertanyaanSurveis,
            pertanyaanCount: nonNullResponses[0].Survei?.PertanyaanSurveis?.length || 0,
            responKeys: Object.keys(nonNullResponses[0].respon || {}).length,
          } : null,
        });
        throw new Error("No valid responses found for analysis. Responses may not have questions or answers. Please ensure responses are completed and have answers.");
      }

      // Classify using AI
      const classificationResult = await aiClassificationService.classifySurvey(
        surveyId,
        validDetailedResponses
      );

      // Transform Python service response to our format
      const pythonData = classificationResult.data;
      
      // Check if data is insufficient (minimum data check)
      if (pythonData.data_insufficient) {
        console.warn("Insufficient data for AI analysis:", pythonData.insufficient_message);
        // Return early with warning message
        return {
          total_respondents: pythonData.satisfaction_overview?.total_respondents || 0,
          satisfaction_percentage: {
            satisfied: 0,
            neutral: 0,
            unsatisfied: 0,
          },
          average_satisfaction: 0,
          sentiment_distribution: {
            positive: 0,
            negative: 0,
            neutral: 0,
          },
          satisfaction_scores: [],
          segments: [],
          pca_2d: [],
          preferences: {},
          correlations: {},
          text_responses: [],
          total_text_responses: 0,
          segment_insights: [],
          data_insufficient: true,
          insufficient_message: pythonData.insufficient_message || "Data belum cukup untuk analisis AI",
        };
      }
      
      // Safe access to sentiment_distribution with fallback
      let sentimentDist = pythonData.satisfaction_overview?.sentiment_distribution;
      
      if (!sentimentDist || (typeof sentimentDist !== 'object')) {
        const satisfactionPct = pythonData.ai_insight_summary?.satisfaction_percentage;
        if (satisfactionPct && typeof satisfactionPct === 'object') {
          const total = pythonData.satisfaction_overview?.total_respondents || 
                       pythonData.analytics_overview?.total_respondents || 0;
          sentimentDist = {
            positive: Math.round((satisfactionPct.satisfied || 0) * total / 100),
            negative: Math.round((satisfactionPct.unsatisfied || 0) * total / 100),
            neutral: Math.round((satisfactionPct.neutral || 0) * total / 100),
          };
        } else {
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
        average_satisfaction: (pythonData.satisfaction_overview?.avg_satisfaction_10 || pythonData.analytics_overview?.avg_satisfaction_10 || 0) / 10,
        sentiment_distribution: sentimentDistribution,
        satisfaction_scores: (pythonData.chart_data?.satisfaction_scores || []).map((score, idx) => ({
          index: idx + 1,
          score: score * 100,
        })),
        segments: (pythonData.segmentation?.segment_details || []).map((segment: any) => ({
          segment_id: segment.segment_id,
          segment_name: segment.segment_name || undefined,  // Logical segment name
          respondent_count: segment.respondent_count,
          satisfaction_percentage: segment.satisfaction_percentage,
          satisfaction_status: segment.satisfaction_status,
          dominant_preference: segment.dominant_preference,
          all_preferences: segment.all_preferences || [],
          satisfaction_range: segment.satisfaction_range,
          avg_age: segment.avg_age,
        })),
        pca_2d: pythonData.segmentation?.pca_2d || [],
        preferences: pythonData.satisfaction_overview?.preferences || {},
        correlations: pythonData.chart_data?.likert_correlation || {},
        major_preference: pythonData.ai_insight_summary?.major_preference
          ? {
              name: pythonData.ai_insight_summary.major_preference.name,
              percentage: pythonData.ai_insight_summary.major_preference.percentage,
            }
          : undefined,
        text_responses: pythonData.text_analysis?.all_text_responses || [],
        total_text_responses: pythonData.text_analysis?.total_text_responses || 0,
        segment_insights: Array.isArray(pythonData.segment_insights) 
          ? pythonData.segment_insights.map((insight: any) => ({
              segment_id: String(insight.segment_id || ""),
              problem: String(insight.problem || ""),
              cause: String(insight.cause || ""),
              recommendation: String(insight.recommendation || ""),
              summary: String(insight.summary || ""),
              satisfaction_status: (insight.satisfaction_status || "medium") as "high" | "medium" | "low",
              confidence: typeof insight.confidence === "number" ? insight.confidence : undefined,
              confidence_label: insight.confidence_label || undefined,
              reason: insight.reason || undefined,
              explainability: insight.explainability ? {
                top_features: (insight.explainability.top_features || []).map((f: any) => ({
                  feature: String(f.feature || ""),
                  importance: String(f.importance || ""),
                  description: String(f.description || ""),
                })),
                average_satisfaction: Number(insight.explainability.average_satisfaction || 0),
                sentiment_trend: String(insight.explainability.sentiment_trend || "stable"),
                respondent_count: Number(insight.explainability.respondent_count || 0),
                segment_rationale: insight.explainability.segment_rationale || undefined,
                recommendation_rationale: insight.explainability.recommendation_rationale || undefined,
              } : undefined,
              low_confidence_warning: Boolean(insight.low_confidence_warning || false),
            }))
          : [],
      };
    },
    enabled: enabled && !!surveyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

