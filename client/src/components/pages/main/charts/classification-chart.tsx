"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface IKGPercentage {
  satisfied: number;
  neutral: number;
  unsatisfied: number;
}

interface ClassificationChartProps {
  satisfactionPercentage?: IKGPercentage;
  isLoading?: boolean;
}

export function ClassificationChart({
  satisfactionPercentage,
  isLoading,
}: ClassificationChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Loading IKG distribution...
        </span>
      </div>
    );
  }

  if (!satisfactionPercentage) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          IKG data not available
        </span>
      </div>
    );
  }

  const data = [
    { label: "Satisfied", value: satisfactionPercentage.satisfied, fill: "#66BB6A" },
    { label: "Neutral", value: satisfactionPercentage.neutral, fill: "#B0BEC5" },
    { label: "Dissatisfied", value: satisfactionPercentage.unsatisfied, fill: "#EF5350" },
  ];

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" interval={0} tick={{ dy: 8 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}