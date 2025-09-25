import db from '../models/index.js';
const { PertanyaanSurvei, Survei, sequelize } = db;
import { parseQuery, metaQueryFormat } from '../utils/queryParser.js';

export const index = async (surveiId, queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['tipe_pertanyaan', 'status'],
    defaultSort: 'index'
  });

  if (surveiId) {
    const survei = await Survei.findByPk(surveiId);
    if (!survei) throw { status: 404, message: 'Survei not found' };

    where.id_survei = surveiId;
  }
  
  const { count, rows } = await PertanyaanSurvei.findAndCountAll({
    where: {
      ...where,
      id_survei: surveiId
    },
    include: [
      { 
        model: Survei, 
        attributes: ['judul', 'status']
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

export const create = async (pertanyaanSurveiData) => {
  const transaction = await sequelize.transaction();

  try {
    const survei = await Survei.findByPk(pertanyaanSurveiData.id_survei, { transaction });
    if (!survei) throw { status: 404, message: 'Survei not found' };

    if (!['draft', 'rejected'].includes(survei.status)) {
      throw { status: 400, message: 'Survei cannot be modified unless it is in draft or rejected status' };
    }

    const maxIndex = await PertanyaanSurvei.count({
      where: { id_survei: pertanyaanSurveiData.id_survei },
      transaction
    });

    const pertanyaanSurvei = await PertanyaanSurvei.create({
      ...pertanyaanSurveiData,
      index: maxIndex + 1
    }, { transaction });

    await transaction.commit();
    return await PertanyaanSurvei.findByPk(pertanyaanSurvei.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const show = async (pertanyaanSurveiId) => {
  const pertanyaanSurvei = await PertanyaanSurvei.findByPk(pertanyaanSurveiId, {
    include: [
      { 
        model: Survei,
        attributes: ['judul', 'status']
      }
    ]
  });
  if (!pertanyaanSurvei) throw { status: 404, message: 'Pertanyaan survei not found' };
  return pertanyaanSurvei;
};

export const update = async (pertanyaanSurveiId, updateData, options = {}) => {
  const transaction = await sequelize.transaction();
  const { skipStatusValidation = false } = options;

  try {
    const pertanyaanSurvei = await PertanyaanSurvei.findByPk(pertanyaanSurveiId, {
      include: [{
        model: Survei,
        attributes: ['status']
      }],
      transaction
    });
    if (!pertanyaanSurvei) throw { status: 404, message: 'Pertanyaan survei not found' };

    if (!skipStatusValidation && !['draft', 'rejected'].includes(pertanyaanSurvei.Survei.status)) {
      throw { status: 400, message: 'Survei cannot be modified unless it is in draft or rejected status.' };
    }

    await pertanyaanSurvei.update(updateData, { transaction });
    await transaction.commit();
    return await PertanyaanSurvei.findByPk(pertanyaanSurvei.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const reorderPertanyaanSurvei = async (id_survei, transaction) => {
  const pertanyaanSurveis = await PertanyaanSurvei.findAll({
    where: { id_survei },
    order: [['index', 'ASC']],
    transaction
  });

  for (let i = 0; i < pertanyaanSurveis.length; i++) {
    if (pertanyaanSurveis[i].index !== i + 1) {
      await pertanyaanSurveis[i].update({ index: i + 1 }, { transaction });
    }
  }
};

export const destroy = async (pertanyaanSurveiId) => {
  const transaction = await sequelize.transaction();

  try {
    const pertanyaanSurvei = await PertanyaanSurvei.findByPk(pertanyaanSurveiId, {
      include: [{
        model: Survei,
        attributes: ['status']
      }],
      transaction
    });
    if (!pertanyaanSurvei) throw { status: 404, message: 'Pertanyaan survei not found' };

    if (!['draft', 'rejected'].includes(pertanyaanSurvei.Survei.status)) {
      throw { status: 400, message: 'Survei cannot be modified unless it is in draft or rejected status.' };
    }

    await pertanyaanSurvei.destroy({ transaction });
    await reorderPertanyaanSurvei(pertanyaanSurvei.id_survei, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
