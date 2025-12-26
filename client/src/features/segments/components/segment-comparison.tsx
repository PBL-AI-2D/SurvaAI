"use client";

import { useState } from "react";
import { GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompareSegments } from "../hooks/useSegments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SegmentComparisonProps {
  availableSegments: Array<{ id: string; cluster_label: string }>;
}

export function SegmentComparison({ availableSegments }: SegmentComparisonProps) {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const compareMutation = useCompareSegments();

  const handleCompare = async () => {
    if (selectedSegments.length < 2) {
      alert("Pilih minimal 2 segment untuk dibandingkan");
      return;
    }

    try {
      const result = await compareMutation.mutateAsync({
        segment_ids: selectedSegments,
      });
      setOpen(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const toggleSegment = (id: string) => {
    setSelectedSegments((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const comparison = compareMutation.data?.data;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Bandingkan Segments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Pilih minimal 2 segment untuk dibandingkan
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSegments.map((segment) => (
                <Button
                  key={segment.id}
                  variant={selectedSegments.includes(segment.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSegment(segment.id)}
                >
                  {segment.cluster_label}
                  {selectedSegments.includes(segment.id) && (
                    <X className="ml-2 h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={selectedSegments.length < 2 || compareMutation.isPending}
          >
            {compareMutation.isPending ? "Membandingkan..." : "Bandingkan"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Perbandingan Segments</DialogTitle>
            <DialogDescription>
              Perbandingan detail antara {selectedSegments.length} segment
            </DialogDescription>
          </DialogHeader>

          {comparison && (
            <div className="space-y-4">
              {/* Metrics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan Metrik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Responden</p>
                      <p className="text-2xl font-bold">
                        {comparison.metrics.total_respondents}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rentang Satisfaction</p>
                      <p className="text-lg font-semibold">
                        {(comparison.metrics.avg_satisfaction_range.min * 100).toFixed(1)}% -{" "}
                        {(comparison.metrics.avg_satisfaction_range.max * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Confidence</p>
                      <p className="text-lg font-semibold">
                        {(comparison.metrics.avg_confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detail Perbandingan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Segment</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Satisfaction</TableHead>
                        <TableHead>Sentiment</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Top Preference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparison.segments.map((seg: any) => (
                        <TableRow key={seg.id}>
                          <TableCell className="font-medium">
                            {seg.cluster_label}
                          </TableCell>
                          <TableCell>{seg.segment_size}</TableCell>
                          <TableCell>
                            {(seg.avg_satisfaction * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            {(seg.avg_sentiment * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                seg.confidence_label === "high"
                                  ? "default"
                                  : seg.confidence_label === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {(seg.confidence_score * 100).toFixed(0)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{seg.dominant_preference}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

