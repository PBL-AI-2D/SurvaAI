import db from'../models/index.js';
const { Hadiah, sequelize } = db;
import { parseQuery, metaQueryFormat } from '../utils/queryParser.js';

export const index = async (queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['stok']
  });
  
  const { count, rows } = await Hadiah.findAndCountAll({
    where: {
      ...where,
    },
    order,
    ...pagination,
    distinct: true
  });

  return {
    data: rows,
    ...metaQueryFormat({ count }, pagination)
  };
};

export const create = async (hadiahData) => {
  const transaction = await sequelize.transaction();

  try {
    const hadiah = await Hadiah.create(hadiahData, { transaction });
    await transaction.commit();
    return await Hadiah.findByPk(hadiah.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const show = async (hadiahId) => {
  const hadiah = await Hadiah.findByPk(hadiahId);
  if (!hadiah) throw { status: 404, message: 'Hadiah not found' };
  return hadiah;
};

export const update = async (hadiahId, updateData) => {
  const transaction = await sequelize.transaction();

  try {
    const hadiah = await Hadiah.findByPk(hadiahId, { transaction });
    if (!hadiah) throw { status: 404, message: 'Hadiah not found' };

    await hadiah.update(updateData, { transaction });
    await transaction.commit();
    return await Hadiah.findByPk(hadiah.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const destroy = async (hadiahId) => {
  const transaction = await sequelize.transaction();

  try {
    const hadiah = await Hadiah.findByPk(hadiahId, { transaction });
    if (!hadiah) throw { status: 404, message: 'Hadiah not found' };

    await hadiah.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};