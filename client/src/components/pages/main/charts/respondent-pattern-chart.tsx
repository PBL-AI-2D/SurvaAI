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
import { TimeOfDayData } from "@/features/survey/utils/chart-data-processor";

interface RespondentPatternChartProps {
  data?: TimeOfDayData[];
  isLoading?: boolean;
}

export function RespondentPatternChart({ data, isLoading }: RespondentPatternChartProps) {
  const chartData = data || [
    { name: "Morning", value: 0, fill: "#42A5F5" },
    { name: "Afternoon", value: 0, fill: "#42A5F5" },
    { name: "Evening", value: 0, fill: "#42A5F5" },
    { name: "Night", value: 0, fill: "#42A5F5" },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const yAxisMax = Math.ceil(maxValue * 1.2);
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => 
    Math.round((yAxisMax / 4) * i)
  );

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
          data={chartData}
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
            ticks={yAxisTicks}
          />
          <Tooltip
            formatter={(value: number) => [`${value}`, "Responses"]}
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
