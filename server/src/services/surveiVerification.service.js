import db from '../models/index.js';
const { Survei, PembayaranSurvei } = db;

export const submitForVerification = async (surveiId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const survei = await Survei.findOne({
      where: { id: surveiId },
      transaction
    });
    if (!survei) throw { status: 404, message: 'Survei not found' };

    if (survei.status !== 'draft' && survei.status !== 'rejected') {
      throw { status: 400, message: `Survei must be in draft status. Current survei status: ${survei.status}` };
    }

    await survei.update({ status: 'under_review' }, { transaction });
    await transaction.commit();
    return survei;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const verifySurvei = async (surveiId, { approve, umpan_balik }) => {
  const transaction = await db.sequelize.transaction();

  try {
    const survei = await Survei.findOne({
      where: { id: surveiId },
      include: [PembayaranSurvei], 
      transaction
    });
    if (!survei) throw { status: 404, message: 'Survei not found' };

    if (survei.status !== 'under_review') {
      throw { status: 400, message: `Survei must be in under_review status. Current status: ${survei.status}.` };
    }

    if (approve) {
      await survei.update({ 
        status: 'payment_pending'
      }, { transaction });
    } else {
      if (!umpan_balik) throw { status: 400, message: 'Umpan balik is required when rejecting a survei' };

      await survei.update({ 
        status: 'rejected',
        umpan_balik,
      }, { transaction });
    }

    await transaction.commit();
    return survei;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
