"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatasetList } from "@/features/dataset-ai/components/dataset-list";
import { DatasetUploadDialog } from "@/features/dataset-ai/components/dataset-upload-dialog";
import { AdminControlPanel } from "@/features/admin-control/components/admin-control-panel";
import { useSystemStatus } from "@/features/admin-control/hooks/useAdminControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AIManagementSection() {
  const { data: systemStatus } = useSystemStatus(true);

  return (
    <Tabs defaultValue="datasets" className="space-y-4">
      <TabsList>
        <TabsTrigger value="datasets">Datasets</TabsTrigger>
        <TabsTrigger value="control">Control</TabsTrigger>
        <TabsTrigger value="status">System Status</TabsTrigger>
      </TabsList>

      <TabsContent value="datasets" className="space-y-4">
        <div className="flex justify-end">
          <DatasetUploadDialog />
        </div>
        <DatasetList />
      </TabsContent>

      <TabsContent value="control" className="space-y-4">
        <AdminControlPanel isAdmin={true} />
      </TabsContent>

      <TabsContent value="status" className="space-y-4">
        {systemStatus?.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Surveys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus.data.total_surveys}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus.data.total_analyses}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {systemStatus.data.processing_analyses}
                  </div>
                  <Badge className="bg-blue-500">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {systemStatus.data.error_analyses}
                  </div>
                  {systemStatus.data.error_analyses > 0 && (
                    <Badge variant="destructive">
                      Needs Attention
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Cache Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    systemStatus.data.cache_status === "connected"
                      ? "default"
                      : "outline"
                  }
                >
                  {systemStatus.data.cache_status === "connected"
                    ? "✅ Connected"
                    : "⚠️ Not Configured"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(systemStatus.data.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}





