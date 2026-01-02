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

// helper agar nama rapi & konsisten
function formatName(name: string) {
  let formatted = name
    .replace(/:/g, ": ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();

  const maxLength = 35;
  if (formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength - 3) + "...";
  }

  return formatted;
}

export function PreferencesChart({
  preferences,
  isLoading,
}: PreferencesChartProps) {
  const total = Object.values(preferences ?? {}).reduce((a, b) => a + b, 0);

  const data = preferences
    ? Object.entries(preferences)
        .map(([name, raw], index) => ({
          name: formatName(name),
          raw,
          value: total > 0 ? (raw / total) * 100 : 0,
          fill: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.raw - a.raw)
        .slice(0, 8)
    : [];

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading chart data...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          No preference data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={100}
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number, _, item) => [
              `${value.toFixed(1)}% (${item.payload.raw} responden)`,
              "Preferensi",
            ]}
          />

          <Legend
            verticalAlign="bottom"
            height={120}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", color: "#6B7280" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}