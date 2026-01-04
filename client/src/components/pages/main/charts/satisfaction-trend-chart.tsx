"use client";

import { useMemo } from "react";
import { calculateEtiScores, predictTrendFromEti } from "@/features/survey/utils/chart-data-processor";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface ETIIndicatorData {
  period: string;
  eti: number;
  trend: "naik" | "stabil" | "turun";
  indicator: 1 | 0 | -1;
}

interface ETIIndicatorChartProps {
  data?: ETIIndicatorData[];
  isLoading?: boolean;
}

export function SatisfactionTrendChart({
  data,
  isLoading,
}: ETIIndicatorChartProps) {
  const chartData = data ?? [];

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Loading ETI indicator...
        </span>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          No ETI data available
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.4} />

          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.5, 0.7, 1]}
            tickFormatter={(v) => v.toFixed(1)}
            label={{
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
            }}
          />

          {/* Threshold — use theme colors and dashed style */}
          <ReferenceLine y={0.7} stroke="var(--color-primary-1)" />
          <ReferenceLine y={0.5} stroke="var(--color-primary-2)"/>

          <Tooltip
            formatter={(value: number, _, payload) => [
              value.toFixed(3),
              `ETI (${payload?.payload?.trend})`,
            ]}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey="eti"
            stroke="var(--color-primary-1)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Expected Trend Indicator"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}