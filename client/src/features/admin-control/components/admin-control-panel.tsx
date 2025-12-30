"use client";

import { useState } from "react";
import { Play, RotateCcw, Settings, Trash2, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useTriggerAnalysis,
  useResetAnalysis,
  useClearCache,
  useSystemStatus,
} from "../hooks/useAdminControl";
import { ThresholdConfigDialog } from "./threshold-config-dialog";
import { Badge } from "@/components/ui/badge";

interface AdminControlPanelProps {
  surveiId?: string;
  isAdmin?: boolean;
}

export function AdminControlPanel({
  surveiId,
  isAdmin = false,
}: AdminControlPanelProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const triggerMutation = useTriggerAnalysis();
  const resetMutation = useResetAnalysis();
  const clearCacheMutation = useClearCache();
  const { data: systemStatus } = useSystemStatus(isAdmin);

  const handleTrigger = async () => {
    if (!surveiId) return;
    await triggerMutation.mutateAsync(surveiId);
  };

  const handleReset = async () => {
    if (!surveiId) return;
    await resetMutation.mutateAsync(surveiId);
    setShowResetConfirm(false);
  };

  const handleClearCache = async () => {
    await clearCacheMutation.mutateAsync();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Admin Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {surveiId && (
          <>
            <div className="flex gap-2">
              <Button
                onClick={handleTrigger}
                disabled={triggerMutation.isPending}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {triggerMutation.isPending
                  ? "Triggering..."
                  : "Trigger Analysis"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(true)}
                disabled={resetMutation.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Konfirmasi Reset</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin mereset analisis? Tindakan ini akan
                    menghapus semua data analisis dan segment untuk survey ini.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReset}
                    disabled={resetMutation.isPending}
                  >
                    {resetMutation.isPending ? "Resetting..." : "Reset"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {isAdmin && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">System Control</h3>
              <div className="space-y-2">
                <ThresholdConfigDialog />

                <Button
                  variant="outline"
                  onClick={handleClearCache}
                  disabled={clearCacheMutation.isPending}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {clearCacheMutation.isPending
                    ? "Clearing..."
                    : "Clear Cache"}
                </Button>
              </div>
            </div>

            {systemStatus?.data && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  System Status
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Surveys</p>
                    <p className="text-lg font-semibold">
                      {systemStatus.data.total_surveys}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Analyses</p>
                    <p className="text-lg font-semibold">
                      {systemStatus.data.total_analyses}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processing</p>
                    <Badge className="bg-blue-500">
                      {systemStatus.data.processing_analyses}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Errors</p>
                    <Badge variant="destructive">
                      {systemStatus.data.error_analyses}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Cache Status</p>
                    <Badge
                      variant={
                        systemStatus.data.cache_status === "connected"
                          ? "default"
                          : "outline"
                      }
                    >
                      {systemStatus.data.cache_status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}





