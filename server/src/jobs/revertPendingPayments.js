import { CronJob } from 'cron';
import { Op } from 'sequelize';
import db from '../models/index.js';

const { Survei } = db;

export const startRevertPendingPaymentsJob = () => {
  return new CronJob(
    '*/15 * * * *',
    async function () {
      const now = new Date();
      const pending = await Survei.findAll({
        where: {
          status: 'payment_pending',
          tanggal_mulai: { [Op.lt]: now },
        },
      });

      for (const survey of pending) {
        survey.status = 'draft';
        await survey.save();
        console.log(`[Cron] Survey "${survey.judul}" reverted to draft due to unpaid status.`);
      }
    },
    null,
    true,
    'Asia/Jakarta'
  );
};
