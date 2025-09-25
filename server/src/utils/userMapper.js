import db from '../models/index.js';
const { Umum } = db;

export const getUmumIdByUserId = async (userId) => {
  const umum = await Umum.findOne({
    where: { id_pengguna: userId },
    attributes: ['id']
  });

  if (!umum) {
    const err = new Error('Umum not found');
    err.status = 404;
    throw err;
  }

  return umum.id;
};
