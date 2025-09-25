import db from '../models/index.js';
const { Pengguna, Admin, Umum, sequelize } = db;
import { parseQuery, metaQueryFormat } from '../utils/queryParser.js';

export const index = async (queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['email', 'role', 'is_completed']
  });

  const { count, rows } = await Pengguna.findAndCountAll({
    where: {
      ...where,
    },
    include: [
      { model: Admin, required: false },
      { model: Umum, required: false }
    ],
    order,
    ...pagination,
    distinct: true
  });

  return {
    data: rows,
    ...metaQueryFormat({ count }, pagination)
  };
};

export const create = async (penggunaData) => {
  const transaction = await sequelize.transaction();

  try {
    const pengguna = await Pengguna.create({
      ...penggunaData,
      email_confirmed: true,
    }, { transaction });

    if (penggunaData.role === 'admin') {
      const adminData = penggunaData.admin ?? {};
      await Admin.create({ 
        id_pengguna: pengguna.id,
        nama_admin: adminData.nama_admin,
        kontak_darurat: adminData.kontak_darurat
      }, { transaction });
    } else {
      const umumData = penggunaData.umum ?? {};
      await Umum.create({
        id_pengguna: pengguna.id,
        nama: umumData.nama,
        profil_responden: umumData.profil_responden,
        profil_klien: umumData.profil_klien
      }, { transaction });
    }

    await transaction.commit();
    return await Pengguna.findByPk(pengguna.id, { include: [Admin, Umum] });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const show = async (penggunaId) => {
  const pengguna = await Pengguna.findByPk(penggunaId, {
    include: [
      { model: Admin, required: false },
      { model: Umum, required: false }
    ]
  });
  if (!pengguna) throw { status: 404, message: 'Pengguna not found' };
  return pengguna;
};

export const update = async (penggunaId, updateData) => {
  const transaction = await sequelize.transaction();

  try {
    const pengguna = await Pengguna.findByPk(penggunaId, { transaction });
    if (!pengguna) throw { status: 404, message: 'Pengguna not found' };

    if (updateData.role && updateData.role !== pengguna.role) {
      throw { status: 400, message: 'Role cannot be changed' };
    }

    await pengguna.update(updateData, { transaction });
    if (pengguna.role === 'admin') {
      const admin = await Admin.findOne({ where: { id_pengguna: penggunaId }, transaction });
      if (admin && updateData.admin) {
        await admin.update({
          nama_admin: updateData.admin.nama_admin,
          kontak_darurat: updateData.admin.kontak_darurat
        }, { transaction });
      }
    } else {
      const umum = await Umum.findOne({ where: { id_pengguna: penggunaId }, transaction });
      if (umum && updateData.umum) {
        await umum.update({
          nama: updateData.umum.nama,
          profil_responden: updateData.umum.profil_responden,
          profil_klien: updateData.umum.profil_klien
        }, { transaction });
      }
    }

    await transaction.commit();
    return await Pengguna.findByPk(penggunaId, { include: [Admin, Umum] });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const destroy = async (penggunaId) => {
  const transaction = await sequelize.transaction();

  try {
    const pengguna = await Pengguna.findByPk(penggunaId, { transaction });
    if (!pengguna) throw { status: 404, message: 'Pengguna not found' };

    await pengguna.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
