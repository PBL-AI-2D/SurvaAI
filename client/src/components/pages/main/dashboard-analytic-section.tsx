"use client";

import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { SummaryCards } from "./summary-cards";
import { SatisfactionAnalysisCard } from "@/features/survey/components/user/satisfaction-analysis-card";
import { useSurveySatisfactionAnalysis } from "@/features/survey/hooks/useSurveySatisfactionAnalysis";
import { useUserSurvey } from "@/features/survey/hooks/useUserSurveys";
import { useResponSurveis } from "@/features/survey-response-result/hooks/useUserSurveyResponseresult";
import { useSegmentsBySurvey } from "@/features/segments/hooks/useSegments";

interface DashboardAnalyticSectionProps {
  surveyId: string;
}

export function DashboardAnalyticSection({
  surveyId,
}: DashboardAnalyticSectionProps) {
  // Fetch survey data to check if it has respondents
  const { data: survey } = useUserSurvey(surveyId);
  const hasRespondents = survey && survey.jumlah_responden > 0;

  // Fetch responses for chart data
  const { responSurveis, isLoading: isLoadingResponses } = useResponSurveis(surveyId, {
    limit: 1000,
    enabled: hasRespondents,
  });

  // Fetch satisfaction analysis
  const {
    data: satisfactionData,
    isLoading: isLoadingSatisfaction,
    isError: isErrorSatisfaction,
  } = useSurveySatisfactionAnalysis(surveyId, hasRespondents);

  // Fetch segments from database (with explainability data)
  const { data: segmentsData } = useSegmentsBySurvey(surveyId, { limit: 100 }, hasRespondents);
  // Extract segments array from response - handle both Sequelize model instances and plain objects
  const segmentsFromDB = useMemo(() => {
    if (!segmentsData?.data?.data) return [];
    return segmentsData.data.data.map((seg: any) => {
      // Convert Sequelize model to plain object if needed
      if (seg && typeof seg.toJSON === 'function') {
        return seg.toJSON();
      }
      return seg;
    });
  }, [segmentsData]);

  const isLoading = isLoadingSatisfaction || isLoadingResponses;

  // Generate conclusion according to Dashboard Analytic Overview theme
  // Using latest data from segmentasiResponden with explainability
  const conclusionText = useMemo(() => {
    if (!satisfactionData) {
      return "AI model analysis will be available once the survey has completed responses.";
    }

    const satisfiedPct = satisfactionData.satisfaction_percentage.satisfied;
    const unsatisfiedPct = satisfactionData.satisfaction_percentage.unsatisfied;
    const avgSatisfaction = (satisfactionData.average_satisfaction * 100).toFixed(1);
    const totalRespondents = satisfactionData.total_respondents;
    
    // Use segments from database (with explainability) if available and has data, otherwise fallback to Python response
    const pythonSegments = satisfactionData.segments || [];
    const dbSegments = segmentsFromDB || [];
    const segmentInsights = satisfactionData.segment_insights || [];
    
    // Prefer DB segments if they exist and have explainability data, otherwise use Python segments
    const segmentsToUse = dbSegments.length > 0 ? dbSegments : pythonSegments;
    const activeSegments = segmentsToUse.length;
    
    // Find best segment with explainability data
    const bestSegment = segmentsToUse.length > 0
      ? (() => {
          const sorted = [...segmentsToUse].sort((a: any, b: any) => {
            // Handle both DB format (avg_satisfaction) and Python format (satisfaction_percentage)
            const aSat = a.avg_satisfaction !== undefined ? a.avg_satisfaction : 
                        (a.satisfaction_percentage !== undefined ? a.satisfaction_percentage / 100 : 0);
            const bSat = b.avg_satisfaction !== undefined ? b.avg_satisfaction : 
                        (b.satisfaction_percentage !== undefined ? b.satisfaction_percentage / 100 : 0);
            return bSat - aSat;
          });
          const best = sorted[0];
          
          // Always try to enrich with explainability data from segment_insights if available
          if (best && segmentInsights.length > 0) {
            // Try multiple matching strategies
            const matchingInsight = segmentInsights.find((insight: any) => {
              const segmentId = String(best.segment_id || best.id || '');
              const insightId = String(insight.segment_id || '');
              const clusterLabel = String(best.cluster_label || '');
              const segmentName = String(best.segment_name || '');
              
              // Match by segment_id
              if (segmentId && insightId && segmentId === insightId) return true;
              // Match by cluster_label
              if (clusterLabel && insightId && clusterLabel === insightId) return true;
              // Match by segment_name
              if (segmentName && insightId && segmentName === insightId) return true;
              // Match by index (if segments are in same order)
              const segmentIndex = segmentsToUse.indexOf(best);
              const insightIndex = segmentInsights.indexOf(insight);
              if (segmentIndex === insightIndex) return true;
              
              return false;
            });
            
            if (matchingInsight) {
              // Merge explainability data from insight (prefer insight data if segment doesn't have it)
              const enriched = {
                ...best,
                segment_rationale: best.segment_rationale || matchingInsight.explainability?.segment_rationale || matchingInsight.reason,
                top_features: best.top_features || matchingInsight.explainability?.top_features || [],
                confidence_score: best.confidence_score !== undefined && best.confidence_score !== null 
                  ? best.confidence_score 
                  : (matchingInsight.confidence !== undefined ? matchingInsight.confidence : undefined),
                confidence_label: best.confidence_label || matchingInsight.confidence_label,
                low_confidence_warning: best.low_confidence_warning !== undefined 
                  ? best.low_confidence_warning 
                  : matchingInsight.low_confidence_warning,
                explainability: best.explainability || matchingInsight.explainability,
              };
              
              // If top_features is from explainability, extract feature names
              if (enriched.top_features && Array.isArray(enriched.top_features) && enriched.top_features.length > 0) {
                enriched.top_features = enriched.top_features.map((f: any) => {
                  if (typeof f === 'string') return f;
                  if (typeof f === 'object' && f.feature) return f.feature;
                  if (typeof f === 'object' && f.name) return f.name;
                  return f;
                });
              }
              
              return enriched;
            }
          }
          
          return best;
        })()
      : null;

    const majorPref = satisfactionData.major_preference;

    // Tema: Dashboard Analytic Overview - fokus pada metrics dan analytics dengan explainability
    let conclusion = `AI model analysis based on ${totalRespondents} completed responses shows an average satisfaction of ${avgSatisfaction}%. `;
    
    if (bestSegment) {
      const segmentName = bestSegment.cluster_label || bestSegment.segment_name || `Segment ${bestSegment.segment_id || bestSegment.id}`;
      
      // Handle both DB format (avg_satisfaction 0-1) and Python format (satisfaction_percentage 0-100)
      let satisfactionPct: number;
      if (bestSegment.avg_satisfaction !== undefined) {
        satisfactionPct = Number((bestSegment.avg_satisfaction * 100).toFixed(1));
      } else if (bestSegment.satisfaction_percentage !== undefined) {
        satisfactionPct = Number(bestSegment.satisfaction_percentage.toFixed(1));
      } else {
        satisfactionPct = 0;
      }
      
      const segmentSize = bestSegment.segment_size || bestSegment.respondent_count || 0;
      
      conclusion += `${segmentName} shows the highest satisfaction at ${satisfactionPct}% (${segmentSize} respondent${segmentSize > 1 ? 's' : ''}). `;
      
      // Add explainability data if available (from database or Python response)
      const segmentRationale = bestSegment.segment_rationale || 
                               (bestSegment as any).explainability?.segment_rationale;
      if (segmentRationale && segmentRationale.trim()) {
        // Use first sentence of rationale for conclusion
        const rationaleFirstSentence = segmentRationale.split('.')[0].trim();
        if (rationaleFirstSentence) {
          conclusion += `${rationaleFirstSentence}. `;
        }
      }
      
      // Add top features if available (from database or Python response)
      const topFeatures = bestSegment.top_features || 
                         (bestSegment as any).explainability?.top_features;
      if (topFeatures && Array.isArray(topFeatures) && topFeatures.length > 0) {
        const topFeature = topFeatures[0];
        const featureName = typeof topFeature === 'string' 
          ? topFeature 
          : (topFeature?.feature || topFeature?.name || '');
        if (featureName && featureName.trim()) {
          conclusion += `Key feature influencing this segment: ${featureName}. `;
        }
      }
      
      // Add confidence info if available (from database or Python response)
      const confidenceScore = bestSegment.confidence_score !== undefined && bestSegment.confidence_score !== null
        ? bestSegment.confidence_score
        : (bestSegment as any).confidence;
      if (confidenceScore !== undefined && confidenceScore !== null) {
        const confidencePct = (confidenceScore * 100).toFixed(0);
        const confidenceLabel = bestSegment.confidence_label || 
                                (bestSegment as any).confidence_label ||
          (confidenceScore >= 0.8 ? 'High' : 
           confidenceScore >= 0.6 ? 'Medium' : 'Low');
        conclusion += `Analysis confidence: ${confidenceLabel} (${confidencePct}%). `;
        
        const lowConfidenceWarning = bestSegment.low_confidence_warning !== undefined 
          ? bestSegment.low_confidence_warning 
          : (bestSegment as any).low_confidence_warning;
        if (lowConfidenceWarning) {
          conclusion += `Note: Low confidence warning - data may not be fully representative. `;
        }
      }
    }

    // Trend prediction
    if (satisfiedPct >= 60) {
      conclusion += `The satisfaction trend is positive with ${satisfiedPct.toFixed(1)}% satisfied responses. `;
    } else if (satisfiedPct < 40) {
      conclusion += `The satisfaction trend indicates concerns with ${unsatisfiedPct.toFixed(1)}% unsatisfied responses. `;
    } else {
      conclusion += `The satisfaction trend is stable with balanced responses. `;
    }

    if (majorPref) {
      conclusion += `Major preference: ${majorPref.name} (${majorPref.percentage.toFixed(1)}% of respondents). `;
    }

    conclusion += `A total of ${activeSegments} active segment${activeSegments > 1 ? 's were' : ' was'} identified through AI clustering analysis.`;

    return conclusion;
  }, [satisfactionData, segmentsFromDB, segmentsData]);

  return (
    <div className="bg-[var(--glass-bg)] rounded-xl shadow-lg border border-border p-6 space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">
          Dashboard Analytic Overview
        </h2>
        <p className="text-muted-foreground">
          Comprehensive metrics and predictive analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div>
        <SummaryCards 
          satisfactionData={satisfactionData}
          totalResponses={responSurveis?.length || 0}
          isLoading={isLoading}
        />
      </div>

      {/* Satisfaction Analysis Section */}
      {hasRespondents && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground text-xl">
            Satisfaction Analysis
          </h3>
          <SatisfactionAnalysisCard
            surveiId={surveyId}
            analysisData={satisfactionData}
            isLoading={isLoadingSatisfaction}
            isError={isErrorSatisfaction}
          />
        </div>
      )}


      {/* Conclusion Box */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="text-sm" style={{ color: "#1F2937", fontWeight: 400 }}>
            <strong style={{ color: "#111827", fontWeight: 600 }}>Conclusion:</strong> {conclusionText}
          </div>
        </div>
      </div>
    </div>
  );
}
