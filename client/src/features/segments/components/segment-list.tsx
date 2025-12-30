"use client";

import { useState } from "react";
import { Eye, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSegmentsBySurvey } from "../hooks/useSegments";
import { SegmentDetailDialog } from "./segment-detail-dialog";
import { formatDate } from "@/utils/dateFormat";

interface SegmentListProps {
  surveiId: string;
}

export function SegmentList({ surveiId }: SegmentListProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const { data, isLoading } = useSegmentsBySurvey(surveiId);

  const segments = data?.data?.data || [];

  const getConfidenceBadge = (score?: number, label?: string) => {
    if (!score) return <Badge variant="outline">N/A</Badge>;
    if (score >= 0.8) {
      return <Badge className="bg-green-500">{label || "High"}</Badge>;
    } else if (score >= 0.6) {
      return <Badge className="bg-yellow-500">{label || "Medium"}</Badge>;
    } else {
      return <Badge variant="destructive">{label || "Low"}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading segments...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Segments ({segments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {segments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada segment
            </div>
          ) : (
            <div className="space-y-4">
              {segments.map((segment: any) => (
                <Card key={segment.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {segment.cluster_label}
                          </h3>
                          {segment.low_confidence_warning && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Low Confidence
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Responden
                            </p>
                            <p className="text-lg font-semibold">
                              {segment.segment_size}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Satisfaction
                            </p>
                            <p className="text-lg font-semibold">
                              {((segment.avg_satisfaction || 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Sentiment
                            </p>
                            <p className="text-lg font-semibold">
                              {((segment.avg_sentiment || 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Confidence
                            </p>
                            <div className="mt-1">
                              {getConfidenceBadge(
                                segment.confidence_score,
                                segment.confidence_label
                              )}
                            </div>
                          </div>
                        </div>

                        {segment.top_features &&
                          segment.top_features.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Top Features:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {segment.top_features
                                  .slice(0, 3)
                                  .map((feature: any, idx: number) => (
                                    <Badge key={idx} variant="outline">
                                      {feature.feature}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}

                        {segment.segment_rationale && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Penjelasan:</p>
                            <p className="line-clamp-2">
                              {segment.segment_rationale}
                            </p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSegmentId(segment.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSegmentId && (
        <SegmentDetailDialog
          segmentId={selectedSegmentId}
          open={!!selectedSegmentId}
          onOpenChange={(open) => !open && setSelectedSegmentId(null)}
        />
      )}
    </>
  );
}





