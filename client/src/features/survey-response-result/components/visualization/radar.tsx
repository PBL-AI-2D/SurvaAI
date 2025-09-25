'use client';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ResponSummary } from '../../types/types';
import { generateSoftColorPalette } from '../../utils/generateSoftColorPalette';
import { useTheme } from 'next-themes';

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface RadarChartProps {
  summary: ResponSummary;
}

export default function RadarChart({ summary }: RadarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const summaryData = summary.summary as Record<string, number>;
  const labels = Object.keys(summaryData);
  const values = Object.values(summaryData);
  const total = values.reduce((acc, cur) => acc + cur, 0);
  const pointColors = generateSoftColorPalette(labels.length);

  const data = {
    labels,
    datasets: [
      {
        label: 'Responses',
        data: values,
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(0, 0, 0, 0.7)',
        pointBackgroundColor: pointColors,
        pointBorderColor: isDark
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(0, 0, 0, 0.6)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#111827' : '#f9fafb',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#1f2937',
        callbacks: {
          label: (context: any) => {
            const val = context.raw ?? 0;
            const percentage = ((val / total) * 100).toFixed(1);
            return `${val} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: Math.max(...values) + 1,
        grid: {
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        },
        angleLines: {
          color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
        },
        pointLabels: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: { weight: 600 as const },
        },
        ticks: {
          display: true,
          stepSize: 1,
          precision: 0,
          color: isDark ? '#e5e7eb' : '#374151',
          backdropColor: 'transparent',
        },
      },
    },
  };

  return <Radar data={data} options={options} plugins={[ChartDataLabels]} />;
}
