"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Product X", value: 45, fill: "var(--color-primary-1)" },
  { name: "Product Y", value: 28, fill: "var(--color-primary-2)" },
  { name: "Product Z", value: 17, fill: "var(--color-primary-3)" },
  { name: "Others", value: 10, fill: "#B0BEC5" },
];

const COLORS = ["var(--color-primary-1)", "var(--color-primary-2)", "var(--color-primary-3)", "#B0BEC5"];

export function PreferencesChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value}%`}
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
            formatter={(value: number) => [`${value}%`, "Percentage"]}
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
