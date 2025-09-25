export const defaultSurveyPayload = {
  judul: "New Survey",
  deskripsi: "",
  kriteria: {},
  jumlah_responden: "1",
  tanggal_mulai: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  tanggal_berakhir: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
};
