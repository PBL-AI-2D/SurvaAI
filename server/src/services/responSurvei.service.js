import db from '../models/index.js';
const { ResponSurvei, Survei, PertanyaanSurvei, Umum, Pengguna, sequelize } = db;
import { parseQuery, metaQueryFormat } from '../utils/queryParser.js';

export const index = async (surveiId = null, queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['id_umum', 'is_completed']
  });

  if (surveiId) {
    const survei = await Survei.findByPk(surveiId);
    if (!survei) throw { status: 404, message: 'Survei not found' };

    where.id_survei = surveiId;
  }

  const { count, rows } = await ResponSurvei.findAndCountAll({
    where,
    include: [
      {
        model: Umum,
        attributes: ['id', 'nama'],
        include: [
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

export const indexAll = async (queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['id_umum', 'id_survei', 'is_completed']
  });

  const { count, rows } = await ResponSurvei.findAndCountAll({
    where,
    include: [
      {
        model: Umum,
        attributes: ['id', 'nama'],
        include: [
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

export const show = async (responSurveiId) => {
  const responSurvei = await ResponSurvei.findByPk(responSurveiId, {
    include: [
      {
        model: Umum,
        attributes: ['id', 'nama'],
        include: [
          {
            model: Pengguna,
            attributes: ['id', 'email']
          }
        ]
      },
      { 
        model: Survei,
        attributes: ['id', 'judul', 'status', 'deskripsi'],
        include: [
          {
            model: PertanyaanSurvei,
            order: [['index', 'ASC']]
          }
        ]
      }
    ]
  });
  if (!responSurvei) throw { status: 404, message: 'Respon survei not found' };
  return responSurvei;
};

export const destroy = async (responSurveiId) => {
  const transaction = await sequelize.transaction();

  try {
    const responSurvei = await ResponSurvei.findByPk(responSurveiId, { transaction });
    if (!responSurvei) throw { status: 404, message: 'Respon survei not found' };

    await responSurvei.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
