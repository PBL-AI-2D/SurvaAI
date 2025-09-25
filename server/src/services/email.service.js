import dayjs from 'dayjs';
import transporter from '../config/email.js';
import { 
  registrationOTPTemplate,
  opinionEmailTemplate,
  penukaranHadiahTemplate,
  invoiceEmailTemplate
} from '../utils/emailTemplates.js';

export const sendRegistrationOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      to: email,
      subject: 'Kode Verifikasi SurvaAnalytics',
      html: registrationOTPTemplate(otp),
      text: `Kode OTP Anda: ${otp} (berlaku 3 menit)`,
    });
    return true;
  } catch (error) {
    throw { status: 500, message: 'Failed to send OTP' };
  }
};

export const sendOpinionEmail = async ({ email, subject, message }) => {
  try {
    await transporter.sendMail({
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `[Opinion] ${subject}`,
      html: opinionEmailTemplate({ email, subject, message }),
      text: `New opinion from ${email}\n\nSubject: ${subject}\nMessage: ${message}`,
    });
    return { email, subject };
  } catch (error) {
    throw { status: 500, message: 'Failed to send opinion email' };
  }
};

export const sendHadiahRedemptionEmail = async ({ email, nama, namaHadiah, totalPoin }) => {
  const tanggalFormatted = dayjs().locale('id').format('dddd, D MMMM YYYY, HH.mm');

  try {
    await transporter.sendMail({
      to: email,
      subject: '[Penukaran Hadiah Berhasil!]',
      html: penukaranHadiahTemplate({
        nama,
        namaHadiah,
        totalPoin,
        tanggal: tanggalFormatted,
      }),
      text: `Penukaran Hadiah: ${namaHadiah}\nTotal Poin: ${totalPoin}\nTanggal: ${tanggalFormatted}`,
    });
  } catch (error) {
    throw { status: 500, message: 'Failed to send reward redemption email' };
  }
};

export const sendSurveyInvoiceEmail = async ({ email, namaSurvei, paidAmount, paymentMethod }) => {
  const tanggalFormatted = dayjs().locale('id').format('dddd, D MMMM YYYY, HH.mm');

  try {
    await transporter.sendMail({
      to: email,
      subject: '[Invoice Pembayaran Survei]',
      html: invoiceEmailTemplate({
        namaSurvei,
        email,
        paidAmount,
        paymentMethod,
        tanggal: tanggalFormatted,
      }),
      text: `Survei: ${namaSurvei}\nTotal Dibayar: Rp ${paidAmount}\nMetode: ${paymentMethod}\nTanggal: ${tanggalFormatted}`,
    });
  } catch (error) {
    throw { status: 500, message: 'Failed to send reward redemption email' };
  }
};
