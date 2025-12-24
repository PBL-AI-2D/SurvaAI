"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PCAPoint } from "@/features/ai-classification/types/types";

interface ScatterPlotChartProps {
  pcaData?: PCAPoint[];
  segments?: Array<{
    segment_id: number;
    segment_name?: string;  // Logical segment name
    satisfaction_status: "high" | "medium" | "low";
  }>;
  isLoading?: boolean;
}

const SEGMENT_COLORS = [
  "var(--color-primary-1)",
  "var(--color-primary-2)",
  "var(--color-secondary-2)",
  "var(--destructive)",
  "#9C27B0",
  "#00BCD4",
  "#FF9800",
  "#795548",
];

export function ScatterPlotChart({ pcaData, segments, isLoading }: ScatterPlotChartProps) {
  // Normalize PCA data for display (PCA typically ranges from -3 to 3)
  const normalizedData = pcaData?.map((point) => ({
    x: point.x,
    y: point.y,
    cluster: point.cluster,
  })) || [];

  // Calculate domain from data
  const xValues = normalizedData.map((d) => d.x);
  const yValues = normalizedData.map((d) => d.y);
  const xMin = Math.min(...xValues, 0);
  const xMax = Math.max(...xValues, 0);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 0);
  const xPadding = (xMax - xMin) * 0.1 || 1;
  const yPadding = (yMax - yMin) * 0.1 || 1;

  // Group data by cluster for multiple Scatter components
  const uniqueClusters = [...new Set(normalizedData.map((d) => d.cluster))].sort((a, b) => a - b);

  if (isLoading) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-sm font-medium text-foreground" style={{ color: "#1F2937" }}>Loading scatter plot data...</div>
      </div>
    );
  }

  if (!normalizedData || normalizedData.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-sm font-medium text-foreground" style={{ color: "#1F2937" }}>No segmentation data available</div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" opacity={0.6} />
          <XAxis
            type="number"
            dataKey="x"
            name="PCA Component 1"
            domain={[xMin - xPadding, xMax + xPadding]}
            tick={{ fontSize: 12, fill: "#1F2937", fontWeight: 500 }}
            axisLine={{ stroke: "#374151", strokeWidth: 1.5 }}
            tickLine={{ stroke: "#374151" }}
            label={{ value: "PCA Component 1 (Satisfaction & Preferences)", position: "insideBottom", offset: -5, style: { fill: "#1F2937", fontWeight: 600, fontSize: 11 } }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="PCA Component 2"
            domain={[yMin - yPadding, yMax + yPadding]}
            tick={{ fontSize: 12, fill: "#1F2937", fontWeight: 500 }}
            axisLine={{ stroke: "#374151", strokeWidth: 1.5 }}
            tickLine={{ stroke: "#374151" }}
            label={{ value: "PCA Component 2 (Sentiment & Features)", angle: -90, position: "insideLeft", style: { fill: "#1F2937", fontWeight: 600, fontSize: 11 } }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: number, name: string) => [value.toFixed(2), name]}
            labelFormatter={(label) => `Cluster: ${label}`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {uniqueClusters.map((clusterId, index) => {
            const clusterData = normalizedData.filter((d) => d.cluster === clusterId);
            const segment = segments?.find((s) => s.segment_id === clusterId);
            const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
            const segmentName = segment?.segment_name || `Segment ${clusterId}`;
            return (
              <Scatter
                key={clusterId}
                name={segmentName}
                data={clusterData}
                fill={color}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      {uniqueClusters.length > 0 && (
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          {uniqueClusters.map((clusterId, index) => {
            const segment = segments?.find((s) => s.segment_id === clusterId);
            const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
            return (
              <div key={clusterId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm font-medium text-foreground" style={{ color: "#1F2937" }}>
                  {segment?.segment_name || `Segment ${clusterId}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
