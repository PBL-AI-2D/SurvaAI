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

const data = [
  { name: "Morning", value: 150, fill: "#42A5F5" },
  { name: "Afternoon", value: 238, fill: "#42A5F5" },
  { name: "Evening", value: 190, fill: "#42A5F5" },
  { name: "Night", value: 80, fill: "#42A5F5" },
];

export function RespondentPatternChart() {
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
            domain={[0, 240]}
            ticks={[0, 60, 120, 180, 240]}
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
