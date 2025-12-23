import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import redis, { safeRedisOperation } from '../../config/redis.js';
import db from '../../models/index.js';
const { Pengguna } = db;
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const userLogin = async (email, password) => {
  const user = await Pengguna.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { status: 401, message: 'Email or password is incorrect' };
  }

  await Pengguna.update(
    { last_sign_in_at: new Date() },
    { where: { id: user.id } }
  );

  const tokenId = uuidv4();
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role, tokenId);

  // Safe Redis operation dengan error handling
  await safeRedisOperation(
    async () => {
      await redis.set(`refresh:${tokenId}`, user.id, { EX: 30 * 24 * 60 * 60 });
    },
    null // Fallback: jika Redis gagal, tetap return token (tapi refresh token tidak akan bisa digunakan)
  );

  return { accessToken, refreshToken };
};

export const userRefresh = async (refreshTokenCookie) => {
  if (!refreshTokenCookie) {
    throw { status: 401, message: 'Missing refresh token' };
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenCookie);
  } catch {
    throw { status: 403, message: 'Invalid refresh token' };
  }

  // Safe Redis operation
  const exists = await safeRedisOperation(
    async () => await redis.get(`refresh:${payload.tokenId}`),
    null // Fallback: jika Redis gagal, anggap token tidak valid
  );

  if (!exists) {
    throw { status: 403, message: 'Refresh token expired or reused' };
  }

  // Safe delete
  await safeRedisOperation(
    async () => await redis.del(`refresh:${payload.tokenId}`),
    null
  );

  const newTokenId = uuidv4();
  const newRefreshToken = generateRefreshToken(payload.userId, payload.role, newTokenId);
  const newAccessToken = generateAccessToken(payload.userId, payload.role);

  // Safe set
  await safeRedisOperation(
    async () => {
      await redis.set(`refresh:${newTokenId}`, payload.userId, { EX: 30 * 24 * 60 * 60 });
    },
    null
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const userLogout = async (refreshToken) => {
  if (!refreshToken) throw { status: 401, message: 'No active session' };

  const { tokenId } = verifyRefreshToken(refreshToken);
  
  // Safe delete
  await safeRedisOperation(
    async () => await redis.del(`refresh:${tokenId}`),
    null
  );
};