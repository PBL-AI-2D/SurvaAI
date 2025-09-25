interface ProfilResponden {
  region: string;
  status: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
}

interface ProfilKlien {
  nama_klien: string;
  kontak_klien: string;
  alamat_klien: string;
}

interface UmumData {
  id: string;
  id_pengguna: string;
  nama: string;
  usia: number;
  profil_responden: ProfilResponden;
  profil_klien: ProfilKlien;
  poin: string;
}

interface AdminData {
  nama_admin: string;
  kontak_darurat: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  Umum?: Partial<UmumData>;
  Admin?: Partial<AdminData>;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  data: UserProfile;
}

export interface UpdateProfilePayload {
  umum?: {
    nama?: string;
    profil_responden?: Partial<ProfilResponden>;
    profil_klien?: Partial<ProfilKlien>;
  };
}
