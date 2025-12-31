export interface DatasetAi {
  id: string;
  nama_dataset: string;
  sumber: string;
  jumlah_data: number;
  jumlah_umaks: number;
  versi: number;
  file_path?: string;
  file_type?: string;
  metadata?: Record<string, any>;
  preview_data?: any[];
  id_survei?: string;
  id_umum?: string;
  tanggal_upload: string;
  Survei?: {
    id: string;
    judul: string;
  };
}

export interface DatasetListResponse {
  status: string;
  message: string;
  data: {
    data: DatasetAi[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UploadDatasetPayload {
  nama_dataset?: string;
  sumber?: string;
  id_survei?: string;
  file: File;
}

export interface DatasetPreviewResponse {
  status: string;
  message: string;
  data: any[];
}






