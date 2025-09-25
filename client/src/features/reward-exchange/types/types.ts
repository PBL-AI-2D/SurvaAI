export interface Pengguna {
  id: string;
  email: string;
}

export interface Umum {
  id: string;
  nama: string;
  Pengguna?: Pengguna;
}

export interface RewardExchange {
  id: string;
  id_umum: string;
  total_poin: string;
  keterangan: string;
  created_at: string;
  updated_at: string;
  Umum?: Umum;
}

export interface RewardExchangeListResponse {
  status: string;
  message: string;
  data: RewardExchange[];
  meta: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

export interface CreateRewardExchangePayload {
  id_hadiah: string;
}

export interface CreateAdminRewardExchangePayload extends CreateRewardExchangePayload {
  id_umum: string
}
