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
            <TableHead className="font-semibold text-foreground">
              Segment
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Respondents
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
          {segments.map((segment) => (
            <TableRow key={segment.segment_id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                Segment {segment.segment_id}
              </TableCell>
              <TableCell>{segment.respondent_count}</TableCell>
              <TableCell>
                {segment.avg_age ? `${segment.avg_age} years` : "N/A"}
              </TableCell>
              <TableCell>
                {segment.dominant_preference || "N/A"}
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
