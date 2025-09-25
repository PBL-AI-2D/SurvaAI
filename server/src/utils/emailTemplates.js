export const registrationOTPTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Verifikasi Email Anda</h2>
    <p>Gunakan kode OTP berikut untuk melanjutkan pendaftaran di SurvaAnalytics:</p>
    <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 24px; letter-spacing: 8px; margin: 24px 0;">
      ${otp}
    </div>
    <p style="color: #6b7280; font-size: 14px;">
      Kode ini akan kadaluarsa dalam 3 menit. Jangan berikan kode ini ke siapapun.
    </p>
  </div>
`;

export const opinionEmailTemplate = ({ email, subject, message }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Opini Baru dari Pengguna</h2>
    <p><strong>Pengirim:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Subjek:</strong> ${subject}</p>
    <div style="background: #f9fafb; padding: 16px; margin: 16px 0; border-left: 4px solid #2563eb;">
      ${message}
    </div>
    <p style="font-size: 13px; color: #6b7280;">Silakan balas langsung ke email pengirim jika perlu menindaklanjuti.</p>
  </div>
`;

export const penukaranHadiahTemplate = ({ nama, namaHadiah, totalPoin, tanggal }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Penukaran Hadiah Berhasil 🎉</h2>
    <p>Halo <strong>${nama}</strong>,</p>
    <p>Berikut detail penukaran hadiah kamu:</p>

    <ul>
      <li><strong>Hadiah:</strong> ${namaHadiah}</li>
      <li><strong>Total Poin Digunakan:</strong> ${totalPoin} pts</li>
      <li><strong>Tanggal Penukaran:</strong> ${tanggal}</li>
    </ul>

    <p>Terima kasih telah menggunakan SurvaAnalytics.</p>
    <p style="color: #6b7280; font-size: 13px;">Email ini dikirim otomatis. Mohon tidak membalas.</p>
  </div>
`;

export const invoiceEmailTemplate = ({ namaSurvei, email, paidAmount, paymentMethod, tanggal }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #2563eb;">Invoice Pembayaran Survei</h2>
    <p>Terima kasih, pembayaran survei Anda telah berhasil.</p>

    <ul>
      <li><strong>Nama Survei:</strong> ${namaSurvei}</li>
      <li><strong>Pemilik Survei:</strong> ${email}</li>
      <li><strong>Total Dibayar:</strong> Rp ${paidAmount.toLocaleString('id-ID')}</li>
      <li><strong>Metode Pembayaran:</strong> ${paymentMethod}</li>
      <li><strong>Tanggal:</strong> ${tanggal}</li>
    </ul>

    <p>Jika Anda memerlukan bukti cetak atau mengalami kendala, silakan hubungi tim kami.</p>
    <p style="color: #6b7280; font-size: 13px;">Email ini dikirim otomatis. Mohon tidak membalas langsung.</p>
  </div>
`;
