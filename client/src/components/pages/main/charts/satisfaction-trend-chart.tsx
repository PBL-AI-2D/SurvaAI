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

interface ETIIndicatorData {
  period: string;
  indicator: number; // -1 = turun, 0 = stabil, 1 = naik
  eti: number;
  trend: "naik" | "stabil" | "turun";
}

interface SatisfactionTrendChartProps {
  eti_scores?: number[];
  trend_predictions?: ("naik" | "stabil" | "turun")[];
  isLoading?: boolean;
}

export function SatisfactionTrendChart({
  eti_scores = [],
  trend_predictions = [],
  isLoading,
}: SatisfactionTrendChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading ETI indicator...
        </div>
      </div>
    );
  }

  const trendToIndicator: Record<string, number> = {
    naik: 1,
    stabil: 0,
    turun: -1,
  };

  const chartData: ETIIndicatorData[] =
    trend_predictions.length > 0
      ? trend_predictions.map((trend, index) => ({
          period: `Periode ${index + 1}`,
          indicator: trendToIndicator[trend],
          trend,
          eti: eti_scores[index] ?? 0,
        }))
      : [
          { period: "Periode 1", indicator: 0, eti: 0, trend: "stabil" },
          { period: "Periode 2", indicator: 0, eti: 0, trend: "stabil" },
        ];

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            label={{
              value: "Time Period",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            domain={[-1, 1]}
            ticks={[-1, 0, 1]}
            tickFormatter={(v) =>
              v === 1 ? "Naik" : v === 0 ? "Stabil" : "Turun"
            }
            label={{
              value: "ETI Indicator",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value: number, _name, props) => {
              const payload = props.payload as ETIIndicatorData;
              return [
                payload.trend.toUpperCase(),
                `ETI: ${payload.eti.toFixed(2)}`,
              ];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="indicator"
            stroke="var(--color-primary-1)"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
            name="ETI Trend Indicator"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}