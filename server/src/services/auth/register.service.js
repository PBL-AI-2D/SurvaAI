import { generateCustomToken } from '../../utils/jwt.js';
import * as otpService from '../otp.service.js';
import * as emailservice from '../email.service.js';
import db from '../../models/index.js';
const { Pengguna, Umum, sequelize } = db;

const generateAndSendOTP = async (user) => {
  const otp = otpService.generateOTP();

  await user.update({
    email_confirmation_token: otp,
    email_confirmation_sent_at: new Date()
  });

  await emailservice.sendRegistrationOTP(user.email, otp);
};

export const emailVerification = async (email) => {
  const existingUser = await Pengguna.findOne({ where: { email } });

  if (existingUser) {
    if (existingUser.email_confirmed) {
      throw { status: 409, message: 'Email is already registered' };
    }

    const timeSinceLastSent = Date.now() - new Date(existingUser.email_confirmation_sent_at || 0).getTime();
    if (timeSinceLastSent < 60 * 1000) {
      return { email ,message: "OTP has already been sent. Please wait a few minutes before trying again" };
    }

    await generateAndSendOTP(existingUser);
    return { email };
  }

  const newUser = await Pengguna.create({
    email,
    password: null,
    email_confirmed: false,
    role: 'umum'
  });

  await generateAndSendOTP(newUser);
  return { email };
};

export const validationOTP = async (email, otp) => {
  const user = await Pengguna.findOne({ where: { email } });
  
  if (!user || !otpService.isOTPValid(user, otp)) {
    throw { status: 400, message: 'Invalid or expired OTP' };
  }
  
  await user.update({ email_confirmation_token: null });
  
  const registerToken = generateCustomToken(
    { userId: user.id, type: 'register' },
    '15m'
  );
  return registerToken;
};

export const completeRegistration = async (penggunaData) => {
  const pengguna = await Pengguna.findByPk(penggunaData.id);
  if (!pengguna) throw { status: 404, message: 'Pengguna not found' };
  if (pengguna.email_confirmed) throw { status: 409, message: 'Registration already completed' };

  const transaction = await sequelize.transaction();
  try {
    await pengguna.update({
      ...penggunaData,
      email_confirmed: true,
      email_confirmation_token: null,
      email_confirmation_sent_at: null
    }, { transaction });

    await Umum.create({
      id_pengguna: penggunaData.id,
      nama: penggunaData.nama,
      profil_responden: penggunaData.profil_responden,
      profil_klien: penggunaData.profil_klien,
    }, { transaction });

    await transaction.commit();
    return await Pengguna.findByPk(penggunaData.id, {attributes: ['id', 'email'], include: [Umum]});    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
