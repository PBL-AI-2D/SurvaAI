import { CronJob } from 'cron';
import { Op } from 'sequelize';
import db from '../models/index.js';

const { Survei } = db;

export const startCloseExpiredSurveysJob = () => {
  return new CronJob(
    '*/10 * * * *',
    async function () {
      const now = new Date();
      const expiredSurveys = await Survei.findAll({
        where: {
          status: 'published',
          tanggal_berakhir: { [Op.lt]: now },
        },
      });

      for (const survey of expiredSurveys) {
        survey.status = 'closed';
        await survey.save();
        console.log(`[Cron] Survey "${survey.judul}" automatically closed.`);
      }
    },
    null,
    true,
    'Asia/Jakarta'
  );
};
