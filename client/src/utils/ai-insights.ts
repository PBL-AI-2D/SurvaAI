/**
 * Utility functions for generating AI insights and model performance alerts
 */

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface ModelPerformanceTrend {
  iter: string;
  accuracy: number;
  f1: number;
  precision: number;
  recall: number;
}

export interface SatisfactionData {
  satisfied: number;
  neutral: number;
  unsatisfied: number;
  total_respondents: number;
  major_preference?: {
    name: string;
    percentage: number;
  };
  segments?: Array<{
    segment_id: number | string;
    satisfaction_percentage: number;
    satisfaction_status: string;
    respondent_count: number;
  }>;
  segment_insights?: Array<{
    segment_id: string;
    problem: string;
    cause: string;
    recommendation: string;
    summary: string;
    satisfaction_status: string;
    confidence?: number;
    confidence_label?: string;
    reason?: string;
    explainability?: {
      top_features: Array<{
        feature: string;
        importance: string;
        description: string;
      }>;
      average_satisfaction: number;
      sentiment_trend: string;
      respondent_count: number;
      segment_rationale?: string;
      recommendation_rationale?: string;
    };
    low_confidence_warning?: boolean;
  }>;
}

/**
 * Generate AI Insight Summary based on recommendation_service insights
 * Uses segment_insights from recommendation_service.py to provide more specific recommendations
 */
export function generateAIInsightSummary(satisfactionData: SatisfactionData | null): string {
  if (!satisfactionData || satisfactionData.total_respondents === 0) {
    return "No survey data is available for analysis. Please wait until respondents complete the survey.";
  }

  const { satisfied, neutral, unsatisfied, total_respondents, major_preference, segments, segment_insights } = satisfactionData;
  
  // Clamp percentages to range 0-100% (keep as numbers, not strings)
  const satisfiedPct = Math.min(Math.max(Number(satisfied) || 0, 0), 100);
  const neutralPct = Math.min(Math.max(Number(neutral) || 0, 0), 100);
  const unsatisfiedPct = Math.min(Math.max(Number(unsatisfied) || 0, 0), 100);

  // Determine trend from segment insights if available
  let trend = "stable";
  if (segment_insights && segment_insights.length > 0) {
    // Get trend from explainability of first segment (or most relevant)
    const firstInsight = segment_insights[0];
    if (firstInsight.explainability?.sentiment_trend) {
      const sentimentTrend = firstInsight.explainability.sentiment_trend;
      if (sentimentTrend === "positive") {
        trend = "increasing";
      } else if (sentimentTrend === "negative") {
        trend = "decreasing";
      }
    }
  } else {
    // Fallback: use satisfaction ratio
    const satisfactionRatio = (Number(satisfied) || 0) / 100;
    if (satisfactionRatio >= 0.6) {
      trend = "increasing";
    } else if (satisfactionRatio < 0.4) {
      trend = "decreasing";
    }
  }

  // Find best segment (use segment_name if available)
  let bestSegment = "";
  if (segments && segments.length > 0) {
    const sortedSegments = [...segments].sort((a, b) => b.satisfaction_percentage - a.satisfaction_percentage);
    const topSegment = sortedSegments[0];
    bestSegment = topSegment.segment_name || `Segment ${topSegment.segment_id}` || "";
  }

  // Build base insight summary menggunakan IKG jika tersedia
  const satisfactionDataTyped = satisfactionData as any;
  const ikgIndex = satisfactionDataTyped?.combined_satisfaction_index;
  const ikgLabel = satisfactionDataTyped?.combined_satisfaction_label;
  const ikgDist = satisfactionDataTyped?.distribution_combined_satisfaction;
  const weightMetadata = satisfactionDataTyped?.weight_metadata;
  const validationMetrics = satisfactionDataTyped?.validation_metrics;
  
  // Gunakan IKG distribution jika tersedia (keep as numbers)
  let finalSatisfiedPct: number = satisfiedPct;
  let finalNeutralPct: number = neutralPct;
  let finalUnsatisfiedPct: number = unsatisfiedPct;
  
  if (ikgDist && total_respondents > 0) {
    finalSatisfiedPct = ((ikgDist.puas || 0) / total_respondents) * 100;
    finalNeutralPct = ((ikgDist.netral || 0) / total_respondents) * 100;
    finalUnsatisfiedPct = ((ikgDist.tidak_puas || 0) / total_respondents) * 100;
  }
  
  const avgSatisfaction = segments && segments.length > 0
    ? (segments.reduce((sum, seg) => sum + seg.satisfaction_percentage, 0) / segments.length).toFixed(1)
    : ikgIndex !== undefined 
      ? ikgIndex.toFixed(1)
      : "0.0";
  
  let insight = "";
  
  if (ikgIndex !== undefined) {
    insight = `Based on the latest survey with ${total_respondents} respondents, the Combined Satisfaction Index (IKG) is ${ikgIndex.toFixed(1)}% (${ikgLabel || 'Netral'}). `;
    insight += `The satisfaction distribution based on IKG shows ${finalSatisfiedPct.toFixed(1)}% satisfied, ${finalNeutralPct.toFixed(1)}% neutral, and ${finalUnsatisfiedPct.toFixed(1)}% unsatisfied. `;
  } else {
    insight = `Based on the latest survey with ${total_respondents} respondents, customer satisfaction shows ${finalSatisfiedPct.toFixed(1)}% satisfied, ${finalNeutralPct.toFixed(1)}% neutral, and ${finalUnsatisfiedPct.toFixed(1)}% unsatisfied. `;
  }

  // Tambahkan explanation tentang dynamic weighting
  if (weightMetadata && weightMetadata.method === "dynamic") {
    insight += `The analysis uses dynamic weighting based on data availability: ${weightMetadata.likert_availability} Likert responses, ${weightMetadata.sentiment_availability} sentiment data, and ${weightMetadata.preference_availability} preference data. `;
  }

  if (major_preference) {
    insight += `The most preferred category or feature is ${major_preference.name} (${major_preference.percentage.toFixed(1)}%). `;
  }

  if (ikgIndex !== undefined) {
    insight += `The Combined Satisfaction Index is ${ikgIndex.toFixed(1)}%. `;
  } else {
    insight += `The average satisfaction score is ${avgSatisfaction}%. `;
  }
  
  // Tambahkan validation metrics jika tersedia
  if (validationMetrics && validationMetrics.interpretation) {
    insight += `${validationMetrics.interpretation} (System validation: Mean Absolute Deviation = ${validationMetrics.mean_absolute_deviation.toFixed(2)}). `;
  }

  if (bestSegment) {
    insight += `The best customer segment is ${bestSegment}. `;
  }

  // Synchronize trend with Conclusion
  let trendText = "";
  if (segment_insights && segment_insights.length > 0) {
    const firstInsight = segment_insights[0];
    if (firstInsight.explainability?.sentiment_trend) {
      const sentimentTrend = firstInsight.explainability.sentiment_trend;
      if (sentimentTrend === "positive") {
        trend = "increasing";
        trendText = `The satisfaction trend shows steady growth, indicating positive product improvements and user experience enhancements.`;
      } else if (sentimentTrend === "negative") {
        trend = "decreasing";
        trendText = `The satisfaction trend shows a decline, which may require attention to product improvements.`;
      } else {
        trend = "stable";
        trendText = `The satisfaction trend remains stable, indicating consistent user experience.`;
      }
    }
  }
  
  if (!trendText) {
    const satisfactionRatio = (Number(satisfied) || 0) / 100;
    if (satisfactionRatio >= 0.6) {
      trend = "increasing";
      trendText = `The satisfaction trend shows steady growth, indicating positive product improvements and user experience enhancements.`;
    } else if (satisfactionRatio < 0.4) {
      trend = "decreasing";
      trendText = `The satisfaction trend shows a decline, which may require attention to product improvements.`;
    } else {
      trend = "stable";
      trendText = `The satisfaction trend remains stable, indicating consistent user experience.`;
    }
  }
  
  insight += trendText + " ";

  // Use recommendations from segment_insights (recommendation_service.py)
  if (segment_insights && segment_insights.length > 0) {
    // Get recommendation from segment with lowest satisfaction (highest priority)
    const sortedInsights = [...segment_insights].sort((a, b) => {
      const aSat = a.explainability?.average_satisfaction || 0;
      const bSat = b.explainability?.average_satisfaction || 0;
      return aSat - bSat; // Sort from lowest to highest
    });

    const priorityInsight = sortedInsights[0];
    
    // Prioritaskan reason jika tersedia, lalu recommendation_rationale, lalu recommendation
    if (priorityInsight.reason) {
      insight += priorityInsight.reason;
    } else if (priorityInsight.explainability?.recommendation_rationale) {
      insight += priorityInsight.explainability.recommendation_rationale;
    } else if (priorityInsight.recommendation) {
      // Get main recommendation from segment with biggest problem
      insight += `Analysis shows: ${priorityInsight.recommendation}`;
    } else {
      // Fallback to summary
      insight += priorityInsight.summary || "";
    }

    // Add warning if confidence is low
    if (priorityInsight.low_confidence_warning) {
      insight += " (Note: This recommendation has a confidence level that needs further verification).";
    }
  } else {
    // Fallback: use general recommendation if no segment insights
    const satisfactionRatio = (Number(satisfied) || 0) / 100;
    if (satisfactionRatio < 0.4) {
      insight += "It is recommended to immediately evaluate and improve aspects that customers complain about.";
    } else if (satisfactionRatio >= 0.6) {
      insight += "This condition shows good performance, maintain service quality and increase innovation.";
    } else {
      insight += "More attention is needed to improve customer satisfaction through enhanced service quality.";
    }
  }

  return insight;
}

/**
 * Analyze model performance and generate alert
 */
export function generateModelPerformanceAlert(
  currentMetrics: ModelPerformanceMetrics,
  trendData: ModelPerformanceTrend[]
): { status: "good" | "warning" | "critical"; message: string; details: string[] } {
  const { accuracy, precision, recall, f1 } = currentMetrics;
  const details: string[] = [];
  let hasWarning = false;
  let hasCritical = false;

  // Check if any metric is below 90%
  if (accuracy < 90) {
    details.push(`Accuracy: ${accuracy.toFixed(1)}% (below 90%)`);
    hasWarning = true;
    if (accuracy < 85) hasCritical = true;
  }
  if (precision < 90) {
    details.push(`Precision: ${precision.toFixed(1)}% (below 90%)`);
    hasWarning = true;
    if (precision < 85) hasCritical = true;
  }
  if (recall < 90) {
    details.push(`Recall: ${recall.toFixed(1)}% (below 90%)`);
    hasWarning = true;
    if (recall < 85) hasCritical = true;
  }
  if (f1 < 90) {
    details.push(`F1-Score: ${f1.toFixed(1)}% (below 90%)`);
    hasWarning = true;
    if (f1 < 85) hasCritical = true;
  }

  // Check trend for last 3 iterations
  if (trendData.length >= 3) {
    const last3 = trendData.slice(-3);
    const accuracyTrend = last3.map(d => d.accuracy);
    const isDecreasing = accuracyTrend[0] > accuracyTrend[1] && accuracyTrend[1] > accuracyTrend[2];
    
    if (isDecreasing) {
      details.push(`Last 3 iterations trend decreasing: ${accuracyTrend[2].toFixed(1)}% → ${accuracyTrend[1].toFixed(1)}% → ${accuracyTrend[0].toFixed(1)}%`);
      hasWarning = true;
    }
  }

  // Check metric differences (if any metric is significantly different from others)
  const metrics = [accuracy, precision, recall, f1];
  const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
  const maxDiff = Math.max(...metrics.map(m => Math.abs(m - avg)));
  
  if (maxDiff > 5) {
    details.push(`Metric difference between models too large (max difference: ${maxDiff.toFixed(1)}%)`);
    hasWarning = true;
  }

  // Generate message
  let status: "good" | "warning" | "critical" = "good";
  let message = "Status: Good – Model performs consistently well.";

  if (hasCritical) {
    status = "critical";
    message = "🚨 Retraining needed – Performance below operational threshold.";
  } else if (hasWarning) {
    status = "warning";
    message = "⚠️ Update recommended – Accuracy dropped in recent iterations.";
  }

  return { status, message, details };
}

