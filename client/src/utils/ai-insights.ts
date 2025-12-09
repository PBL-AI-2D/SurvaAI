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
}

/**
 * Generate AI Insight Summary based on latest survey data
 */
export function generateAIInsightSummary(satisfactionData: SatisfactionData | null): string {
  if (!satisfactionData || satisfactionData.total_respondents === 0) {
    return "Belum ada data survei yang tersedia untuk dianalisis. Tunggu hingga ada responden yang menyelesaikan survei.";
  }

  const { satisfied, neutral, unsatisfied, total_respondents, major_preference, segments } = satisfactionData;
  
  const satisfiedPct = ((satisfied / total_respondents) * 100).toFixed(1);
  const neutralPct = ((neutral / total_respondents) * 100).toFixed(1);
  const unsatisfiedPct = ((unsatisfied / total_respondents) * 100).toFixed(1);

  // Determine trend (simplified - in real implementation, compare with previous period)
  const satisfactionRatio = satisfied / total_respondents;
  let trend = "stabil";
  if (satisfactionRatio >= 0.6) {
    trend = "meningkat";
  } else if (satisfactionRatio < 0.4) {
    trend = "menurun";
  }

  // Find best segment
  let bestSegment = "";
  if (segments && segments.length > 0) {
    const sortedSegments = [...segments].sort((a, b) => b.satisfaction_percentage - a.satisfaction_percentage);
    bestSegment = `Segment ${sortedSegments[0].segment_id}` || "";
  }

  // Build insight summary
  let insight = `Berdasarkan survei terbaru dengan ${total_respondents} responden, kondisi kepuasan pelanggan menunjukkan ${satisfiedPct}% puas, ${neutralPct}% netral, dan ${unsatisfiedPct}% tidak puas. `;

  if (major_preference) {
    insight += `Kategori atau fitur yang paling disukai adalah ${major_preference.name} (${major_preference.percentage.toFixed(1)}%). `;
  }

  if (bestSegment) {
    insight += `Segmen pelanggan terbaik adalah ${bestSegment}. `;
  }

  insight += `Tren kepuasan saat ini ${trend}. `;

  // Add actionable recommendation
  if (satisfactionRatio < 0.4) {
    insight += "Disarankan untuk segera melakukan evaluasi dan perbaikan pada aspek yang dikeluhkan pelanggan.";
  } else if (satisfactionRatio >= 0.6) {
    insight += "Kondisi ini menunjukkan performa yang baik, pertahankan kualitas layanan dan tingkatkan inovasi.";
  } else {
    insight += "Perlu perhatian lebih untuk meningkatkan tingkat kepuasan pelanggan melalui peningkatan kualitas layanan.";
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
    details.push(`Accuracy: ${accuracy.toFixed(1)}% (di bawah 90%)`);
    hasWarning = true;
    if (accuracy < 85) hasCritical = true;
  }
  if (precision < 90) {
    details.push(`Precision: ${precision.toFixed(1)}% (di bawah 90%)`);
    hasWarning = true;
    if (precision < 85) hasCritical = true;
  }
  if (recall < 90) {
    details.push(`Recall: ${recall.toFixed(1)}% (di bawah 90%)`);
    hasWarning = true;
    if (recall < 85) hasCritical = true;
  }
  if (f1 < 90) {
    details.push(`F1-Score: ${f1.toFixed(1)}% (di bawah 90%)`);
    hasWarning = true;
    if (f1 < 85) hasCritical = true;
  }

  // Check trend for last 3 iterations
  if (trendData.length >= 3) {
    const last3 = trendData.slice(-3);
    const accuracyTrend = last3.map(d => d.accuracy);
    const isDecreasing = accuracyTrend[0] > accuracyTrend[1] && accuracyTrend[1] > accuracyTrend[2];
    
    if (isDecreasing) {
      details.push(`Tren 3 iterasi terakhir menurun: ${accuracyTrend[2].toFixed(1)}% → ${accuracyTrend[1].toFixed(1)}% → ${accuracyTrend[0].toFixed(1)}%`);
      hasWarning = true;
    }
  }

  // Check metric differences (if any metric is significantly different from others)
  const metrics = [accuracy, precision, recall, f1];
  const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
  const maxDiff = Math.max(...metrics.map(m => Math.abs(m - avg)));
  
  if (maxDiff > 5) {
    details.push(`Selisih metrik antar-model terlalu jauh (selisih maks: ${maxDiff.toFixed(1)}%)`);
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

