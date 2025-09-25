export interface ProfilMetadata {
  usia: number;
  region: string;
  status: string;
  jenis_kelamin: string;
}

export interface ResponSurvei {
  id: string;
  id_survei: string;
  id_umum: string;
  profil_metadata: ProfilMetadata;
  respon: Record<string, string | string[]>;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  Umum: {
    id: string;
    nama: string;
    Pengguna: {
      id: string;
      email: string;
    };
  };
  Survei?: {
    id: string;
    judul: string;
    status: string;
    deskripsi?: string;
    PertanyaanSurveis?: {
      id: string;
      id_survei: string;
      teks_pertanyaan: string;
      tipe_pertanyaan: string;
      opsi: string[] | null;
      is_required: boolean;
      tipe_visualisasi: string;
      index: number;
    }[];
  };
}

export interface ResponSurveiListResponse {
  status: string;
  message: string;
  data: ResponSurvei[];
  meta: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

export interface ResponSummary {
  id_pertanyaan: string;
  index: number;
  teks_pertanyaan: string;
  tipe_pertanyaan: string;
  tipe_visualisasi: string;
  summary: Record<string, number> | string[];
  total_responden: number;
  total_respon: number;
}
