"use client";

import { useState } from "react";
import { FileText, Eye, Trash2, Clock, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDatasetAi, useDeleteDataset, useDatasetAiPreview } from "../hooks/useDatasetAi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/dateFormat";

export function DatasetList() {
  const [page, setPage] = useState(1);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const { data, isLoading } = useDatasetAi({ page, limit: 10 });
  const deleteMutation = useDeleteDataset();
  const { data: previewData } = useDatasetAiPreview(previewId || "", 10, !!previewId);

  const datasets = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus dataset ini?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {datasets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada dataset
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Dataset</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Jumlah Data</TableHead>
                    <TableHead>Versi</TableHead>
                    <TableHead>Tanggal Upload</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((dataset: any) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium">
                        {dataset.nama_dataset}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{dataset.sumber}</Badge>
                      </TableCell>
                      <TableCell>{dataset.jumlah_data}</TableCell>
                      <TableCell>
                        <Badge>v{dataset.versi}</Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(dataset.tanggal_upload)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewId(dataset.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(dataset.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview Dataset</DialogTitle>
            <DialogDescription>
              Menampilkan 10 baris pertama dari dataset
            </DialogDescription>
          </DialogHeader>
          {previewData?.data && previewData.data.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(previewData.data[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.data.map((row: any, idx: number) => (
                    <TableRow key={idx}>
                      {Object.values(row).map((value: any, cellIdx: number) => (
                        <TableCell key={cellIdx}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Tidak ada data untuk ditampilkan
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}





