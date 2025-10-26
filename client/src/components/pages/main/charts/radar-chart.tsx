"use client";

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const data = [
  { category: "Kategori X", segmen1: 100, segmen2: 80, segmen3: 60 },
  { category: "Kategori Y", segmen1: 70, segmen2: 90, segmen3: 85 },
  { category: "Kategori Z", segmen1: 60, segmen2: 70, segmen3: 95 },
];

export function RadarChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Segmen 1"
            dataKey="segmen1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
          />
          <Radar
            name="Segmen 2"
            dataKey="segmen2"
            stroke="#60A5FA"
            fill="#60A5FA"
            fillOpacity={0.3}
          />
          <Radar
            name="Segmen 3"
            dataKey="segmen3"
            stroke="#9CA3AF"
            fill="#9CA3AF"
            fillOpacity={0.3}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Segmen 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span className="text-sm text-gray-600">Segmen 2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span className="text-sm text-gray-600">Segmen 3</span>
        </div>
      </div>
    </div>
  );
}
