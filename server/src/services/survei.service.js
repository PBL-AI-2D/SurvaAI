import db from '../models/index.js';
const { Survei, PertanyaanSurvei, Umum, Pengguna, sequelize } = db;
import { parseQuery, metaQueryFormat } from '../utils/queryParser.js';

export const index = async (queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['id_umum', 'status', 'judul', 'tanggal_mulai', 'tanggal_berakhir']
  });

  const { count, rows } = await Survei.findAndCountAll({
    where: {
      ...where,
    },
    include: [
      { 
        model: Umum,
        attributes: ['id', 'nama', 'profil_klien'],
        include : [
          {
            model: Pengguna,
            attributes: ['id', 'email']
          }
        ]
      }
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

export const create = async (surveiData) => {
  const transaction = await sequelize.transaction();
  
  try {
    const survei = await Survei.create( surveiData, { transaction });

    await transaction.commit();
    return await Survei.findByPk(survei.id, { include: [Umum] });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const show = async (surveiId) => {
  const survei = await Survei.findByPk(surveiId, {
    include: [
      {
        model: Umum,
        attributes: ['id', 'nama', 'profil_klien'],
      },
      {
        model: PertanyaanSurvei,
        separate: true,
        order: [['index', 'ASC']],
      }
    ]
  });
  if (!survei) throw { status: 404, message: 'Survei not found' };
  return survei;
};

export const update = async (surveiId, updateData) => {
  const transaction = await sequelize.transaction();

  try {
    const survei = await Survei.findByPk(surveiId, { transaction });
    if (!survei) throw { status: 404, message: 'Survei not found' };

    await survei.update(updateData, { transaction });
    await transaction.commit();
    return await Survei.findByPk(survei.id, { include: [Umum] });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const destroy = async (surveiId) => {
  const transaction = await sequelize.transaction();

  try {
    const survei = await Survei.findByPk(surveiId, { transaction });
    if (!survei) throw { status: 404, message: 'Survei not found' };

    await survei.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
