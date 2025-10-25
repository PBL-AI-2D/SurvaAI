"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const segmentationData = [
  {
    segment: "Segment 1",
    averageAge: 28,
    dominantPreference: "Product X",
    satisfaction: 85,
  },
  {
    segment: "Segment 2",
    averageAge: 42,
    dominantPreference: "Product Y",
    satisfaction: 50,
  },
  {
    segment: "Segment 3",
    averageAge: 35,
    dominantPreference: "Product X",
    satisfaction: 65,
  },
  {
    segment: "Segment 4",
    averageAge: 52,
    dominantPreference: "Product Z",
    satisfaction: 33,
  },
];

export function SegmentationTable() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold text-foreground">
              Segment
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Avg. Age
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Dominant Preference
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Satisfaction %
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segmentationData.map((row, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell className="font-medium">{row.segment}</TableCell>
              <TableCell>{row.averageAge} years</TableCell>
              <TableCell>{row.dominantPreference}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.satisfaction >= 80
                      ? "bg-green-100 text-green-800"
                      : row.satisfaction >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {row.satisfaction}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
