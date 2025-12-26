"use client";

import { Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisStatus } from "../hooks/useAnalysisAi";
import { formatDate } from "@/utils/dateFormat";

interface AnalysisStatusCardProps {
  surveiId: string;
}

export function AnalysisStatusCard({ surveiId }: AnalysisStatusCardProps) {
  const { data, isLoading } = useAnalysisStatus(surveiId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = data?.data;
  if (!status) return null;

  const getStatusIcon = () => {
    switch (status.status) {
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "done":
        return <Badge className="bg-green-500">Selesai</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Status Analisis AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge()}
        </div>

        {status.last_analysis_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Terakhir Analisis:</span>
            <span className="text-sm font-medium">
              {formatDate(status.last_analysis_at)}
            </span>
          </div>
        )}

        {status.processing_duration && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Durasi:</span>
            <span className="text-sm font-medium">
              {formatDuration(status.processing_duration)}
            </span>
          </div>
        )}

        {status.error_message && (
          <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Error:</p>
                <p className="text-sm text-destructive/80">{status.error_message}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}





