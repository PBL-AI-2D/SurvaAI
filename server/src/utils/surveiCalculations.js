export const kalkulasiJumlahTagihanSurvei = (konfigurasi, survei, jumlahPertanyaan) => {
  const durasiHari = Math.ceil(
    (new Date(survei.tanggal_berakhir) - new Date(survei.tanggal_mulai)) / (1000 * 60 * 60 * 24)
  );

  const hargaDasar = Number(konfigurasi.harga_dasar);
  const hargaPertanyaan = Number(konfigurasi.harga_per_pertanyaan) * jumlahPertanyaan;
  const hargaResponden = Number(konfigurasi.harga_per_responden) * survei.jumlah_responden;
  const hargaDurasi = Number(konfigurasi.harga_per_durasi) * durasiHari;

  return hargaDasar + hargaPertanyaan + hargaResponden + hargaDurasi;
};

export const kalkulasiHadiahPoinSurvei = ({ paidAmount, jumlahResponden }) => {
  const jml = Number(jumlahResponden);
  const nominal = Number(paidAmount);
  if (!jml || jml <= 0) throw new Error('Jumlah responden tidak valid');

  const minBiayaPerResponden = 500;
  if (nominal < jml * minBiayaPerResponden) {
    throw new Error('Pembayaran terlalu kecil dibanding jumlah responden');
  }

  const poinPerRp = 0.1;
  const rewardPercent = 0.2;
  const rewardPerResponden = (nominal / jml) * rewardPercent;
  const rawPoin = Math.floor(rewardPerResponden * poinPerRp);

  return rawPoin;
};
