export interface Pengguna {
  id: string;
  email: string;
  password: string;
  email_confirmed: boolean;
  email_confirmation_token: string | null;
  reauth_token: string | null;
  email_confirmation_sent_at: string | null;
  last_sign_in_at: string | null;
  reauth_sent_at: string | null;
  role: 'admin' | 'umum';
  created_at: string;
  updated_at: string;
  Admin: Admin | null;
  Umum: Umum | null;
}

export interface Admin {
  id: string;
  id_pengguna: string;
  nama_admin: string;
  kontak_darurat: string;
}

export interface Umum {
  usia: number | null;
  id: string;
  id_pengguna: string;
  nama: string;
  profil_responden?: ProfilResponden;
  profil_klien?: ProfilKlien;
  poin: string;
}

export interface ProfilResponden {
  region?: string;
  status?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
}

export interface ProfilKlien {
  nama_klien?: string;
  alamat_klien?: string;
  kontak_klien?: string;
  initialized?: boolean;
}

export interface GetPenggunasResponse {
  status: string;
  message: string;
  data: Pengguna[];
  meta: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

export interface GetPenggunaResponse {
  status: string;
  message: string;
  data: Pengguna;
}

export interface CreatePenggunaResponse {
  status: string;
  message: string;
  data: Pengguna;
}

export interface CreatePenggunaPayload {
  email: string;
  password: string;
  role: 'admin' | 'umum';
  admin?: CreateAdminPayload;
  umum?: CreateUmumPayload;
}

export interface CreateAdminPayload {
  nama_admin: string;
  kontak_darurat: string;
}

export interface CreateUmumPayload {
  nama: string;
  profil_responden?: ProfilResponden;
  profil_klien?: ProfilKlien;
  poin?: string;
}

export interface UpdatePenggunaPayload {
  email?: string;
  password?: string;
  email_confirmed?: boolean;
  role?: 'admin' | 'umum';
  admin?: Partial<CreateAdminPayload>;
  umum?: Partial<CreateUmumPayload>;
}
