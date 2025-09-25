'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ResponSummary } from '../../types/types';
import { generateSoftColorPalette } from '../../utils/generateSoftColorPalette';
import { useTheme } from 'next-themes';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PieChartProps {
  summary: ResponSummary;
}

export default function PieChart({ summary }: PieChartProps) {
  const { resolvedTheme } = useTheme();

  const summaryData = summary.summary as Record<string, number>;
  const labels = Object.keys(summaryData);
  const values = Object.values(summaryData);
  const total = values.reduce((acc, val) => acc + val, 0);
  const backgroundColor = generateSoftColorPalette(labels.length);

  const isDark = resolvedTheme === 'dark';

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'start' as const,
        labels: {
          color: isDark ? '#e4e4e7' : '#1f2937', // tailwind slate-200 / slate-800
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      datalabels: {
        color: isDark ? '#f4f4f5' : '#1f2937',
        formatter: (_: number, context: any) => {
          const val = context.dataset.data[context.dataIndex];
          const percentage = ((val / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        font: {
          weight: 'bold' as const,
        },
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
  };

  return (
    <div className="w-full h-full">
      <Pie data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
}
