"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSegmentDetails } from "../hooks/useSegments";
import { formatDate } from "@/utils/dateFormat";
import { AlertCircle, TrendingUp, Users } from "lucide-react";

interface SegmentDetailDialogProps {
  segmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SegmentDetailDialog({
  segmentId,
  open,
  onOpenChange,
}: SegmentDetailDialogProps) {
  const { data, isLoading } = useSegmentDetails(segmentId, open);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            Loading...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const segment = data?.data;
  if (!segment) return null;

  const getConfidenceBadge = () => {
    const score = segment.confidence_score || 0;
    if (score >= 0.8) {
      return <Badge className="bg-green-500">High ({Math.round(score * 100)}%)</Badge>;
    } else if (score >= 0.6) {
      return <Badge className="bg-yellow-500">Medium ({Math.round(score * 100)}%)</Badge>;
    } else {
      return <Badge variant="destructive">Low ({Math.round(score * 100)}%)</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Detail Segment: {segment.cluster_label}</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang segment ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Jumlah Responden</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {segment.segment_size}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence Score</p>
                  <div className="mt-1">{getConfidenceBadge()}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Satisfaction</p>
                  <p className="text-lg font-semibold">
                    {((segment.avg_satisfaction || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Sentiment</p>
                  <p className="text-lg font-semibold">
                    {((segment.avg_sentiment || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {segment.low_confidence_warning && (
                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Warning: Confidence score rendah. Data mungkin tidak representatif.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Features */}
          {segment.top_features && segment.top_features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {segment.top_features.map((feature: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-md bg-muted"
                    >
                      <span className="text-sm font-medium">{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        {feature.frequency && (
                          <Badge variant="outline">Freq: {feature.frequency}</Badge>
                        )}
                        {feature.importance && (
                          <Badge>
                            Importance: {(feature.importance * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rationales */}
          {segment.segment_rationale && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Penjelasan Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{segment.segment_rationale}</p>
              </CardContent>
            </Card>
          )}

          {segment.recommendation_rationale && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rekomendasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{segment.recommendation_rationale}</p>
              </CardContent>
            </Card>
          )}

          {/* Respondents */}
          {segment.respondents && segment.respondents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Responden ({segment.respondent_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segment.respondents.map((respondent: any) => (
                      <TableRow key={respondent.id}>
                        <TableCell>
                          {respondent.Umum?.nama || "Anonymous"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={respondent.is_completed ? "default" : "outline"}
                          >
                            {respondent.is_completed ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(respondent.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}





