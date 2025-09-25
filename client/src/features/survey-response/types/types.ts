export interface Pengguna {
  id: string;
  email: string;
}

export interface Umum {
  id: string;
  nama: string;
  Pengguna: Pengguna;
}

export interface ProfilMetadata {
  usia?: number;
  region?: string;
  status?: string;
  jenis_kelamin?: string;
}

export interface ResponSurvei {
  id: string;
  id_survei: string;
  id_umum: string | null;
  profil_metadata: ProfilMetadata;
  respon: Record<string, string>;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  Umum?: Umum;
}

export interface Meta {
  total_items: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface ResponSurveiResponse {
  status: 'success' | 'fail';
  message: string;
  data: ResponSurvei[];
  meta: Meta;
}
