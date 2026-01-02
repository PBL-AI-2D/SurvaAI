import { ResponSurvei } from '@/features/survey-response-result/types/types';
import { AIClassificationData } from '@/features/ai-classification/types/types';

/**
 * Utility untuk memproses data responses menjadi format chart
 */

export interface TimeOfDayData {
  name: string;
  value: number;
  fill: string;
}

/**
 * Group responses berdasarkan waktu dalam sehari (Morning, Afternoon, Evening, Night)
 */
export function processResponseTimePattern(responses: ResponSurvei[]): TimeOfDayData[] {
  const timeGroups = {
    Morning: 0,    // 6:00 - 12:00
    Afternoon: 0,  // 12:00 - 18:00
    Evening: 0,    // 18:00 - 24:00
    Night: 0,      // 0:00 - 6:00
  };

  responses.forEach((response) => {
    if (!response.created_at) return;
    
    const date = new Date(response.created_at);
    const hour = date.getHours();
    
    if (hour >= 6 && hour < 12) {
      timeGroups.Morning++;
    } else if (hour >= 12 && hour < 18) {
      timeGroups.Afternoon++;
    } else if (hour >= 18 && hour < 24) {
      timeGroups.Evening++;
    } else {
      timeGroups.Night++;
    }
  });

  return [
    { name: "Morning", value: timeGroups.Morning, fill: "#42A5F5" },
    { name: "Afternoon", value: timeGroups.Afternoon, fill: "#42A5F5" },
    { name: "Evening", value: timeGroups.Evening, fill: "#42A5F5" },
    { name: "Night", value: timeGroups.Night, fill: "#42A5F5" },
  ];
}

export interface WeeklySatisfactionData {
  week: string;
  satisfaction: number;
}

/**
 * Process satisfaction scores menjadi weekly trend
 * Jika data kurang dari 4 minggu, buat grouping berdasarkan waktu
 */
export function processSatisfactionTrend(
  responses: ResponSurvei[],
  satisfactionData?: AIClassificationData
): WeeklySatisfactionData[] {
  // Prefer raw IKG per-respondent if backend exposes it (0-100 values)
  if (satisfactionData?.ikg_raw_scores && satisfactionData.ikg_raw_scores.length > 0) {
    const scores = satisfactionData.ikg_raw_scores.map((s) => s.score);
    const chunkSize = Math.max(1, Math.ceil(scores.length / 4));
    const weeks: WeeklySatisfactionData[] = [];

    for (let i = 0; i < 4; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, scores.length);
      const chunk = scores.slice(start, end);

      if (chunk.length > 0) {
        const avgSatisfaction = chunk.reduce((sum, s) => sum + s, 0) / chunk.length;
        weeks.push({
          week: `Week ${i + 1}`,
          satisfaction: Math.round(avgSatisfaction),
        });
      }
    }

    return weeks.length > 0 ? weeks : [
      { week: "Week 1", satisfaction: 0 },
      { week: "Week 2", satisfaction: 0 },
      { week: "Week 3", satisfaction: 0 },
      { week: "Week 4", satisfaction: 0 },
    ];
  }

  // Jika ada satisfaction scores dari analisis (legacy), gunakan itu
  if (satisfactionData?.satisfaction_scores && satisfactionData.satisfaction_scores.length > 0) {
    const scores = satisfactionData.satisfaction_scores;
    const chunkSize = Math.ceil(scores.length / 4);
    const weeks: WeeklySatisfactionData[] = [];
    
    for (let i = 0; i < 4; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, scores.length);
      const chunk = scores.slice(start, end);
      
      if (chunk.length > 0) {
        const avgSatisfaction = chunk.reduce((sum, s) => sum + s.score, 0) / chunk.length;
        weeks.push({
          week: `Week ${i + 1}`,
          satisfaction: Math.round(avgSatisfaction),
        });
      }
    }
    
    return weeks.length > 0 ? weeks : [
      { week: "Week 1", satisfaction: 0 },
      { week: "Week 2", satisfaction: 0 },
      { week: "Week 3", satisfaction: 0 },
      { week: "Week 4", satisfaction: 0 },
    ];
  }

  // Fallback: group berdasarkan created_at
  if (responses.length === 0) {
    return [
      { week: "Week 1", satisfaction: 0 },
      { week: "Week 2", satisfaction: 0 },
      { week: "Week 3", satisfaction: 0 },
      { week: "Week 4", satisfaction: 0 },
    ];
  }

  // Group responses by week
  const sortedResponses = [...responses].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const firstDate = new Date(sortedResponses[0].created_at);
  const weeks: WeeklySatisfactionData[] = [];
  
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(firstDate);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekResponses = sortedResponses.filter((r) => {
      const date = new Date(r.created_at);
      return date >= weekStart && date < weekEnd;
    });
    
    weeks.push({
      week: `Week ${i + 1}`,
      satisfaction: weekResponses.length > 0 ? Math.round((weekResponses.length / sortedResponses.length) * 100) : 0,
    });
  }

  return weeks;
}

/**
 * Generate conclusion text berdasarkan data real
 */
export function generateConclusion(
  satisfactionData?: AIClassificationData,
  responses: ResponSurvei[] = [],
  timePattern?: TimeOfDayData[]
): string {
  if (!satisfactionData) {
    return "Data analisis belum tersedia. Pastikan survey memiliki minimal 1 response yang completed.";
  }

  const totalRespondents = satisfactionData.total_respondents || responses.length;
  const avgSatisfaction = satisfactionData.average_satisfaction * 100;
  const trend = satisfactionData.segments?.length > 0 
    ? satisfactionData.segments[0].satisfaction_status === 'high' ? 'positive' 
      : satisfactionData.segments[0].satisfaction_status === 'medium' ? 'stable' 
      : 'negative'
    : 'stable';
  
  const trendText = trend === 'positive' ? 'positive momentum' 
    : trend === 'negative' ? 'negative trend' 
    : 'stable satisfaction';
  
  const highestSegment = satisfactionData.segments?.length > 0
    ? satisfactionData.segments.reduce((max, seg) => 
        seg.satisfaction_percentage > max.satisfaction_percentage ? seg : max
      )
    : null;
  
  const peakTime = timePattern?.reduce((max, time) => 
    time.value > max.value ? time : max
  ) || { name: "Afternoon", value: 0 };
  
  const majorPreference = satisfactionData.major_preference
    ? `${satisfactionData.major_preference.name} (${satisfactionData.major_preference.percentage.toFixed(1)}%)`
    : "N/A";

  return `AI model predicts ${trendText} with average satisfaction of ${avgSatisfaction.toFixed(1)}%. ${
    highestSegment 
      ? `Segment ${highestSegment.segment_id} shows highest satisfaction at ${highestSegment.satisfaction_percentage.toFixed(1)}%. `
      : ""
  }Response patterns indicate peak engagement during ${peakTime.name.toLowerCase()} hours (${peakTime.value} responses). ${
    satisfactionData.major_preference
      ? `Major preference: ${majorPreference}. `
      : ""
  }Total of ${totalRespondents} completed responses analyzed.`;
}

