import db from '../models/index.js';
const { KonfigurasiSurvei, sequelize } = db;

export const index = async () => {
  const config = await KonfigurasiSurvei.findByPk(1);
  if (!config) {
    throw { status: 404, message: 'Konfigurasi harga has not been initialized' };
  }
  return config;
};

export const create = async (configPriceData) => {
  const transaction = await sequelize.transaction();
  
  try {
    const existingConfigPrice = await KonfigurasiSurvei.findByPk(1);
    if (existingConfigPrice) {
      throw { status: 409, message: 'Konfigurasi harga has been initialized' };
    }

    const newConfigPrice = await KonfigurasiSurvei.create({
      id: 1,
      ...configPriceData
    }, { transaction });

    await transaction.commit();
    return newConfigPrice;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const update = async (updateData) => {
  const transaction = await sequelize.transaction();
  
  try {
    const existingConfigPrice = await KonfigurasiSurvei.findByPk(1);
    if (!existingConfigPrice) throw { status: 404, message: 'Konfigurasi harga not found' };
    
    await existingConfigPrice.update(updateData, { transaction });

    await transaction.commit();
    return await KonfigurasiSurvei.findByPk(1);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
