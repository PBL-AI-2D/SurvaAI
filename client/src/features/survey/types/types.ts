export type SurveiStatus =
  | 'draft'
  | 'under_review'
  | 'payment_pending'
  | 'published'
  | 'closed'
  | 'archived'
  | 'rejected'

export interface Pengguna {
  id: string
  email: string
}

export interface Umum {
  id: string
  nama: string
  profil_klien: Record<string, any>
  Pengguna?: Pengguna
}

export interface PertanyaanSurvei {
  id: string
  id_survei: string
  teks_pertanyaan: string
  tipe_pertanyaan: string
  opsi: string[]
  is_required: boolean
  tipe_visualisasi: string
  index: number
}

export interface Survei {
  id: string
  id_umum: string | null
  judul: string
  deskripsi?: string
  status: SurveiStatus
  kriteria: Record<string, any>
  jumlah_responden: string
  tanggal_mulai: string
  tanggal_berakhir: string
  hadiah_poin: string
  umpan_balik?: string
  created_at: string
  updated_at: string
  Umum?: Umum
};

export interface SurveyListResponse {
  status: string
  message: string
  data: Survei[]
  meta: {
    total_items: number
    total_pages: number
    current_page: number
    per_page: number
  }
};

export interface SurveyDetailResponse {
  status: string
  message: string
  data: Survei & {
    Umum?: Umum
    PertanyaanSurveis: PertanyaanSurvei[]
  }
}

export interface CreateUserSurveiPayload {
  judul: string
  deskripsi?: string
  kriteria: Record<string, any>
  jumlah_responden: string
  tanggal_mulai: string
  tanggal_berakhir: string
  hadiah_poin?: string
}

export interface UpdateUserSurveiPayload extends Partial<CreateUserSurveiPayload> {
  status?: SurveiStatus
  umpan_balik?: string
}

export interface CreateAdminSurveiPayload extends CreateUserSurveiPayload {
  id_umum: string;
}
