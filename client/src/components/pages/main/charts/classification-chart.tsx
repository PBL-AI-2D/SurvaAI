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
import { SatisfactionPercentage } from "@/features/ai-classification/types/types";

interface ClassificationChartProps {
  satisfactionPercentage?: SatisfactionPercentage;
  isLoading?: boolean;
}

export function ClassificationChart({ satisfactionPercentage, isLoading }: ClassificationChartProps) {
  const data = satisfactionPercentage
    ? [
        { name: "Satisfied", value: satisfactionPercentage.satisfied, fill: "#66BB6A" },
        { name: "Neutral", value: satisfactionPercentage.neutral, fill: "#B0BEC5" },
        { name: "Unsatisfied", value: satisfactionPercentage.unsatisfied, fill: "#EF5350" },
      ]
    : [
        { name: "Satisfied", value: 0, fill: "#66BB6A" },
        { name: "Neutral", value: 0, fill: "#B0BEC5" },
        { name: "Unsatisfied", value: 0, fill: "#EF5350" },
      ];

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const yAxisMax = Math.ceil(maxValue * 1.2);

  if (isLoading) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
            domain={[0, yAxisMax]}
            ticks={Array.from({ length: 5 }, (_, i) => Math.round((yAxisMax / 4) * i))}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, "Percentage"]}
            labelStyle={{ color: "#374151", fontWeight: "500" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
