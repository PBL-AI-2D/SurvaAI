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

// Generate sample data for scatter plot with 4 segments
const generateScatterData = () => {
  const data = [];
  const segments = [
    { name: "Segment 1", color: "var(--color-primary-1)", x: 70, y: 75 }, // Green - High satisfaction & preference
    { name: "Segment 2", color: "var(--color-primary-2)", x: 45, y: 50 }, // Red - Medium satisfaction & preference
    { name: "Segment 3", color: "var(--color-secondary-2)", x: 60, y: 65 }, // Orange - Medium-high satisfaction & preference
    { name: "Segment 4", color: "var(--destructive)", x: 25, y: 35 }, // Purple - Low satisfaction & preference
  ];

  segments.forEach((segment, segmentIndex) => {
    for (let i = 0; i < 20; i++) {
      data.push({
        x: segment.x + (Math.random() - 0.5) * 15,
        y: segment.y + (Math.random() - 0.5) * 15,
        segment: segment.name,
        color: segment.color,
      });
    }
  });

  return data;
};

const data = generateScatterData();

export function ScatterPlotChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            dataKey="x"
            name="Satisfaction Score"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Preference Score"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: number, name: string) => [value, name]}
            labelStyle={{ color: "#374151", fontWeight: "500" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Scatter dataKey="y" fill="var(--color-primary-1)" />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--color-primary-1)] rounded"></div>
          <span className="text-sm text-muted-foreground">Segment 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--color-primary-2)] rounded"></div>
          <span className="text-sm text-muted-foreground">Segment 2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--color-secondary-2)] rounded"></div>
          <span className="text-sm text-muted-foreground">Segment 3</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded"></div>
          <span className="text-sm text-muted-foreground">Segment 4</span>
        </div>
      </div>
    </div>
  );
}
