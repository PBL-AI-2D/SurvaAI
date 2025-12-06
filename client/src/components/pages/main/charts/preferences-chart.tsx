"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PreferencesChartProps {
  preferences?: Record<string, number>;
  isLoading?: boolean;
}

const COLORS = [
  "var(--color-primary-1)",
  "var(--color-primary-2)",
  "var(--color-primary-3)",
  "#9C27B0",
  "#00BCD4",
  "#FF9800",
  "#795548",
  "#B0BEC5",
];

export function PreferencesChart({ preferences, isLoading }: PreferencesChartProps) {
  // Convert preferences object to array format
  const data = preferences
    ? Object.entries(preferences)
        .map(([name, value], index) => ({
          name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          value: value,
          fill: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // Limit to top 8 preferences
    : [];

  if (isLoading) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">No preference data available</div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
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
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
