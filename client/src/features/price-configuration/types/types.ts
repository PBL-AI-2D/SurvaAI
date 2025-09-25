export interface KonfigurasiHarga {
  id: number;
  harga_dasar: string;
  harga_per_pertanyaan: string;
  harga_per_responden: string;
  harga_per_durasi: string;
  updated_at: string;
}

export interface KonfigurasiHargaResponse {
  status: number;
  message: string;
  data: KonfigurasiHarga | null;
}

export interface CreateKonfigurasiHargaPayload {
  harga_dasar: number;
  harga_per_pertanyaan: number;
  harga_per_responden: number;
  harga_per_durasi: number;
}

export type UpdateKonfigurasiHargaPayload = Partial<CreateKonfigurasiHargaPayload>;
