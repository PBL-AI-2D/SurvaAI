"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadDataset } from "../hooks/useDatasetAi";
import { useUserSurveys } from "@/features/survey/hooks/useUserSurveys";

interface DatasetUploadDialogProps {
  surveiId?: string;
  onSuccess?: () => void;
}

export function DatasetUploadDialog({
  surveiId,
  onSuccess,
}: DatasetUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const uploadMutation = useUploadDataset();
  const { data: surveys } = useUserSurveys();

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        nama_dataset: data.nama_dataset || selectedFile.name,
        sumber: data.sumber || "file_upload",
        id_survei: data.id_survei || surveiId,
      });
      reset();
      setSelectedFile(null);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const validExtensions = [".csv", ".xlsx", ".xls"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (
        validTypes.includes(file.type) ||
        validExtensions.includes(ext)
      ) {
        setSelectedFile(file);
      } else {
        alert("File tidak valid. Hanya CSV dan Excel yang didukung.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Dataset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Dataset</DialogTitle>
          <DialogDescription>
            Upload file CSV atau Excel untuk analisis AI
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File Dataset</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4" />
                <span className="text-sm flex-1">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.file && (
              <p className="text-sm text-destructive">File wajib diisi</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_dataset">Nama Dataset (Opsional)</Label>
            <Input
              id="nama_dataset"
              {...register("nama_dataset")}
              placeholder="Nama untuk dataset ini"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sumber">Sumber (Opsional)</Label>
            <Input
              id="sumber"
              {...register("sumber")}
              placeholder="Sumber data"
            />
          </div>

          {!surveiId && (
            <div className="space-y-2">
              <Label htmlFor="id_survei">Survey (Opsional)</Label>
              <select
                id="id_survei"
                {...register("id_survei")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Pilih Survey</option>
                {surveys?.data?.data?.map((survey: any) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.judul}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
                setSelectedFile(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

