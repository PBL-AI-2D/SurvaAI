'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ResponSummary } from '../../types/types';
import { generateSoftColorPalette } from '../../utils/generateSoftColorPalette';
import { useTheme } from 'next-themes';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface BarChartProps {
  summary: ResponSummary;
}

export default function BarChart({ summary }: BarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const summaryData = summary.summary as Record<string, number>;
  const labels = Object.keys(summaryData);
  const values = Object.values(summaryData);
  const total = values.reduce((acc, val) => acc + val, 0);
  const backgroundColor = generateSoftColorPalette(labels.length);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor,
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        clip: false,
        anchor: 'end' as const,
        align: 'end' as const,
        formatter: (_: number, context: any) => {
          const val = context.dataset.data[context.dataIndex];
          const percentage = ((val / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        font: {
          weight: 'bold' as const,
        },
        offset: -7,
        color: isDark ? '#f4f4f5' : '#1f2937',
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        titleColor: isDark ? '#f3f4f6' : '#1f2937',
        bodyColor: isDark ? '#e4e4e7' : '#1f2937',
        callbacks: {
          title: (context: any[]) => context[0].label ?? '',
          label: (context: any) => {
            const val = context.raw ?? 0;
            const percentage = ((val / total) * 100).toFixed(1);
            return `${val} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#e4e4e7' : '#1f2937',
        },
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: isDark ? '#e4e4e7' : '#1f2937',
        },
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
      },
    },
  };

  return <Bar data={data} options={options} plugins={[ChartDataLabels]} />;
}
