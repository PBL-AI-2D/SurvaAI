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

      // Debug: ensure backend IKG payload is logged for troubleshooting
      // eslint-disable-next-line no-console
      console.log("IKG API RESPONSE (satisfaction analysis)", pythonData);
      
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
      // Accept either 'sentiment_distribution' (old frontend name)
      // or backend-provided 'satisfaction_distribution'
      let sentimentDist =
        pythonData.satisfaction_overview?.sentiment_distribution ??
        pythonData.satisfaction_overview?.satisfaction_distribution;
      
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

      // Expose raw backend distribution directly so IKG distribution charts
      // can consume the backend-provided values without recomputation.
      const satisfaction_distribution_raw =
        pythonData.satisfaction_overview?.satisfaction_distribution ??
        pythonData.satisfaction_overview?.sentiment_distribution ??
        undefined;
      
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
        // IKG Explainability & System Validity
        ikg_explainability: Array.isArray(pythonData.ikg_explainability)
          ? pythonData.ikg_explainability.map((exp: any) => ({
              respondent_index: Number(exp.respondent_index || 0),
              ikg_value: Number(exp.ikg_value || 0),
              // Preserve backend-provided label; do not default to "Netral" here
              label: exp.label ? (exp.label as "Puas" | "Netral" | "Tidak Puas") : undefined,
              components_used: Array.isArray(exp.components_used) ? exp.components_used.map(String) : [],
              component_scores: {
                likert: typeof exp.component_scores?.likert === "number" ? exp.component_scores.likert : undefined,
                sentiment: typeof exp.component_scores?.sentiment === "number" ? exp.component_scores.sentiment : undefined,
                preference: typeof exp.component_scores?.preference === "number" ? exp.component_scores.preference : undefined,
              },
              weights_applied: {
                likert: Number(exp.weights_applied?.likert || 0),
                sentiment: Number(exp.weights_applied?.sentiment || 0),
                preference: Number(exp.weights_applied?.preference || 0),
              },
              base_weights: {
                likert: Number(exp.base_weights?.likert || 0),
                sentiment: Number(exp.base_weights?.sentiment || 0),
                preference: Number(exp.base_weights?.preference || 0),
              },
              adaptive_adjustment: String(exp.adaptive_adjustment || ""),
              explanation: String(exp.explanation || ""),
              reason: String(exp.reason || ""),
              sentiment_confidence: typeof exp.sentiment_confidence === "number" ? exp.sentiment_confidence : undefined,
              detected_language: String(exp.detected_language || "unknown"),
              details: {
                likert_details: Array.isArray(exp.details?.likert_details) ? exp.details.likert_details.map(String) : [],
                preference_details: Array.isArray(exp.details?.preference_details) ? exp.details.preference_details.map(String) : [],
              },
            }))
          : undefined,
        sentiment_confidence_scores: Array.isArray(pythonData.sentiment_confidence_scores)
          ? pythonData.sentiment_confidence_scores.map((score: any) => 
              typeof score === "number" ? score : undefined
            )
          : undefined,
        average_sentiment_confidence: typeof pythonData.average_sentiment_confidence === "number"
          ? pythonData.average_sentiment_confidence
          : undefined,
        weight_metadata: pythonData.weight_metadata ? {
          method: (pythonData.weight_metadata.method || "default") as "dynamic" | "default",
          likert_availability: String(pythonData.weight_metadata.likert_availability || ""),
          sentiment_availability: String(pythonData.weight_metadata.sentiment_availability || ""),
          preference_availability: String(pythonData.weight_metadata.preference_availability || ""),
          avg_confidence: Number(pythonData.weight_metadata.avg_confidence || 0),
          low_confidence_ratio: String(pythonData.weight_metadata.low_confidence_ratio || ""),
        } : undefined,
        validation_metrics: pythonData.validation_metrics ? {
          mean_absolute_deviation: Number(pythonData.validation_metrics.mean_absolute_deviation || 0),
          max_deviation: typeof pythonData.validation_metrics.max_deviation === "number" 
            ? pythonData.validation_metrics.max_deviation 
            : undefined,
          min_deviation: typeof pythonData.validation_metrics.min_deviation === "number"
            ? pythonData.validation_metrics.min_deviation
            : undefined,
          interpretation: String(pythonData.validation_metrics.interpretation || ""),
        } : undefined,
        combined_satisfaction_index: typeof pythonData.combined_satisfaction_index === "number"
          ? pythonData.combined_satisfaction_index
          : undefined,
        combined_satisfaction_label: pythonData.combined_satisfaction_label
          ? (pythonData.combined_satisfaction_label as "Puas" | "Netral" | "Tidak Puas")
          : undefined,
        distribution_combined_satisfaction: pythonData.distribution_combined_satisfaction ? {
          puas: Number(pythonData.distribution_combined_satisfaction.puas || 0),
          netral: Number(pythonData.distribution_combined_satisfaction.netral || 0),
          tidak_puas: Number(pythonData.distribution_combined_satisfaction.tidak_puas || 0),
        } : undefined,
        // Expose raw per-respondent IKG (0-100) if backend provides it under known keys
        ikg_raw_scores: Array.isArray(pythonData.ikg_per_respondent_100)
          ? pythonData.ikg_per_respondent_100.map((s: any, idx: number) => ({ index: idx + 1, score: Number(s || 0) }))
          : Array.isArray(pythonData.per_respondent)
            ? pythonData.per_respondent.map((s: any, idx: number) => ({ index: idx + 1, score: Number(s || 0) }))
            : Array.isArray(pythonData.ikg_per_respondent)
              ? pythonData.ikg_per_respondent.map((s: any, idx: number) => ({ index: idx + 1, score: Number(s || 0) }))
              : undefined,
        // Provide raw distribution from backend for charts that need direct values
        satisfaction_distribution_raw: satisfaction_distribution_raw,
      };
    },
    enabled: enabled && !!surveyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

