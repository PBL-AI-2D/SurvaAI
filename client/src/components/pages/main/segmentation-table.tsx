"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerSegment } from "@/features/ai-classification/types/types";

interface SegmentationTableProps {
  segments?: CustomerSegment[];
  isLoading?: boolean;
}

export function SegmentationTable({ segments, isLoading }: SegmentationTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading segmentation data...
        </div>
      </div>
    );
  }

  if (!segments || segments.length === 0) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-8 text-center text-sm text-muted-foreground">
          No segmentation data available
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold" style={{ color: "#111827", fontWeight: 600 }}>
              Segment
            </TableHead>
            <TableHead className="font-semibold" style={{ color: "#111827", fontWeight: 600 }}>
              Respondents
            </TableHead>
            <TableHead className="font-semibold" style={{ color: "#111827", fontWeight: 600 }}>
              Key Characteristics
            </TableHead>
            <TableHead className="font-semibold" style={{ color: "#111827", fontWeight: 600 }}>
              Satisfaction %
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map((segment) => (
            <TableRow key={segment.segment_id} className="hover:bg-muted/50">
              <TableCell className="font-medium" style={{ color: "#1F2937", fontWeight: 500 }}>
                {segment.segment_name || `Segment ${segment.segment_id}`}
              </TableCell>
              <TableCell style={{ color: "#1F2937", fontWeight: 400 }}>{segment.respondent_count}</TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  {segment.dominant_preference && segment.dominant_preference !== "N/A" ? (
                    <div className="text-sm">
                      <span className="font-medium" style={{ color: "#111827", fontWeight: 600 }}>Preference:</span>{" "}
                      <span style={{ color: "#374151", fontWeight: 400 }}>{segment.dominant_preference}</span>
                    </div>
                  ) : null}
                  {segment.all_preferences && segment.all_preferences.length > 1 ? (
                    <div className="text-xs" style={{ color: "#4B5563", fontWeight: 400 }}>
                      <span className="font-medium" style={{ color: "#111827", fontWeight: 600 }}>Also:</span> {segment.all_preferences.slice(1).join(", ")}
                    </div>
                  ) : null}
                  {segment.satisfaction_range && segment.satisfaction_range.includes(" - ") ? (
                    <div className="text-xs" style={{ color: "#4B5563", fontWeight: 400 }}>
                      <span className="font-medium" style={{ color: "#111827", fontWeight: 600 }}>Range:</span> {segment.satisfaction_range}
                    </div>
                  ) : null}
                  {segment.avg_age ? (
                    <div className="text-xs" style={{ color: "#4B5563", fontWeight: 400 }}>
                      Avg. Age: {segment.avg_age} years
                    </div>
                  ) : null}
                  {!segment.dominant_preference || segment.dominant_preference === "N/A" ? (
                    <span className="text-sm" style={{ color: "#6B7280", fontWeight: 400 }}>No specific preference identified</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    segment.satisfaction_percentage >= 80
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : segment.satisfaction_percentage >= 60
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {segment.satisfaction_percentage.toFixed(1)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
