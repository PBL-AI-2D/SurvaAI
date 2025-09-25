'use client';

import dynamic from 'next/dynamic';
import { ResponSummary } from '../types/types';

interface ChartRendererProps {
  summary: ResponSummary;
}

export const VisualRenderer = ({ summary }: ChartRendererProps) => {
  if (!summary) {
    return (
      <div className="text-sm text-muted-foreground italic text-center">
        Data is not available.
      </div>
    );
  }

  const isObjectSummary =
    typeof summary.summary === 'object' && !Array.isArray(summary.summary);
  const isEmpty =
    (isObjectSummary && Object.keys(summary.summary).length === 0) ||
    (Array.isArray(summary.summary) && summary.summary.length === 0);

  if (isEmpty) {
    return (
      <div className="text-sm text-muted-foreground italic text-center">
        No responses available for this question.
      </div>
    );
  }

  switch (summary.tipe_visualisasi) {
    case 'pie':
      return <PieChart summary={summary} />;
    case 'bar':
      return <BarChart summary={summary} />;
    case 'doughnut':
      return <DoughnutChart summary={summary} />;
    case 'radar':
      return <RadarChart summary={summary} />;
    case 'text':
      return <TextAnswersChart summary={summary} />;
    case 'wordcloud':
      return <WordCloud texts={summary.summary as string[]} />;
    case 'sentiment_analysis':
      return <SentimentAnalysis texts={summary.summary as string[]} />;
    default:
      return (
        <div className="text-sm text-muted-foreground italic text-center">
          Visualization not available.
        </div>
      );
  }
};

const PieChart = dynamic(() => import('./visualization/pie'));
const BarChart = dynamic(() => import('./visualization/bar'));
const DoughnutChart = dynamic(() => import('./visualization/doughnut'));
const RadarChart = dynamic(() => import('./visualization/radar'));
const TextAnswersChart = dynamic(() => import('./visualization/text'));
const WordCloud = dynamic(() => import('./visualization/wordcloud'));
const SentimentAnalysis = dynamic(() => import('./visualization/sentiment-analysis'));
