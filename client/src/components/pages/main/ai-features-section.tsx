"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatasetList } from "@/features/dataset-ai/components/dataset-list";
import { DatasetUploadDialog } from "@/features/dataset-ai/components/dataset-upload-dialog";
import { AnalysisStatusCard } from "@/features/analysis-ai/components/analysis-status-card";
import { SegmentList } from "@/features/segments/components/segment-list";
import { SegmentComparison } from "@/features/segments/components/segment-comparison";
import { AdminControlPanel } from "@/features/admin-control/components/admin-control-panel";
import { useSegmentsBySurvey } from "@/features/segments/hooks/useSegments";
import { useAuthStore } from "@/features/auth/stores/store";

interface AIFeaturesSectionProps {
  surveiId: string;
}

export function AIFeaturesSection({ surveiId }: AIFeaturesSectionProps) {
  const { user } = useAuthStore();
  const { data: segmentsData } = useSegmentsBySurvey(surveiId);
  const segments = segmentsData?.data?.data || [];
  const isAdmin = user?.role === "admin";

  const availableSegments = segments.map((seg: any) => ({
    id: seg.id,
    cluster_label: seg.cluster_label,
  }));

  return (
    <Tabs defaultValue="status" className="space-y-4">
      <TabsList>
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="datasets">Datasets</TabsTrigger>
        <TabsTrigger value="segments">Segments</TabsTrigger>
        <TabsTrigger value="control">Control</TabsTrigger>
      </TabsList>

      <TabsContent value="status" className="space-y-4">
        <AnalysisStatusCard surveiId={surveiId} />
      </TabsContent>

      <TabsContent value="datasets" className="space-y-4">
        <div className="flex justify-end">
          <DatasetUploadDialog surveiId={surveiId} />
        </div>
        <DatasetList />
      </TabsContent>

      <TabsContent value="segments" className="space-y-4">
        <SegmentList surveiId={surveiId} />
        {segments.length >= 2 && (
          <SegmentComparison availableSegments={availableSegments} />
        )}
      </TabsContent>

      <TabsContent value="control" className="space-y-4">
        <AdminControlPanel surveiId={surveiId} isAdmin={isAdmin} />
      </TabsContent>
    </Tabs>
  );
}






