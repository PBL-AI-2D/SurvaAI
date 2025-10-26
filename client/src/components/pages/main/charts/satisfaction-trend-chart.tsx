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

const data = [
  { week: "Week 1", productX: 70, productY: 60, productZ: 55 },
  { week: "Week 2", productX: 72, productY: 62, productZ: 56 },
  { week: "Week 3", productX: 75, productY: 64, productZ: 55 },
  { week: "Week 4", productX: 78, productY: 65, productZ: 55 },
];

export function SatisfactionTrendChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}%`, name]}
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
            dataKey="productX"
            stroke="var(--color-primary-1)"
            strokeWidth={3}
            dot={{ fill: "var(--color-primary-1)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-primary-1)", strokeWidth: 2 }}
            name="Product X"
          />
          <Line
            type="monotone"
            dataKey="productY"
            stroke="var(--color-primary-2)"
            strokeWidth={3}
            dot={{ fill: "var(--color-primary-2)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-primary-2)", strokeWidth: 2 }}
            name="Product Y"
          />
          <Line
            type="monotone"
            dataKey="productZ"
            stroke="var(--color-primary-3)"
            strokeWidth={3}
            dot={{ fill: "var(--color-primary-3)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-primary-3)", strokeWidth: 2 }}
            name="Product Z"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
