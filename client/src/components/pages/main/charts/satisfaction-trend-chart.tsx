"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WeeklySatisfactionData } from "@/features/survey/utils/chart-data-processor";

interface SatisfactionTrendChartProps {
  data?: WeeklySatisfactionData[];
  isLoading?: boolean;
}

export function SatisfactionTrendChart({ data, isLoading }: SatisfactionTrendChartProps) {
  const chartData = data || [
    { week: "Period 1", satisfaction: 0 },
    { week: "Period 2", satisfaction: 0 },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" opacity={0.6} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: "#1F2937", fontWeight: 500 }}
            axisLine={{ stroke: "#374151", strokeWidth: 1.5 }}
            tickLine={{ stroke: "#374151" }}
            label={{ value: "Time Period (Expected Trend Index)", position: "insideBottom", offset: -5, style: { fill: "#1F2937", fontWeight: 600, fontSize: 11 } }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#1F2937", fontWeight: 500 }}
            axisLine={{ stroke: "#374151", strokeWidth: 1.5 }}
            tickLine={{ stroke: "#374151" }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: "Satisfaction Index (%)", angle: -90, position: "insideLeft", style: { fill: "#1F2937", fontWeight: 600, fontSize: 11 } }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Satisfaction"]}
            labelStyle={{ color: "#374151", fontWeight: "500" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="line"
            wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
          />
          <Line
            type="monotone"
            dataKey="satisfaction"
            stroke="var(--color-primary-1)"
            strokeWidth={3}
            dot={{ fill: "var(--color-primary-1)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-primary-1)", strokeWidth: 2 }}
            name="Expected Trend Index"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
