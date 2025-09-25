import Joi from 'joi';

function getDateOnlyUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
const minStartDate = getDateOnlyUTC(new Date(Date.now() + 3 * 86400000));

export const createUserSurveiSchema = Joi.object({
  judul: Joi.string().max(255).required(),
  deskripsi: Joi.string().allow('').optional(),
  jumlah_responden: Joi.number().integer().min(1).max(1000).required(),
  tanggal_mulai: Joi.date().iso().min(minStartDate).required(),
  tanggal_berakhir: Joi.date().iso().greater(Joi.ref('tanggal_mulai')).required(),
  kriteria: Joi.object().optional()
});

export const updateUserSurveiSchema = Joi.object({
  judul: Joi.string().max(255).optional(),
  deskripsi: Joi.string().allow('').optional(),
  jumlah_responden: Joi.number().integer().min(1).max(1000).optional(),
  tanggal_mulai: Joi.date().iso().min(minStartDate).optional(),
  tanggal_berakhir: Joi.date().iso().greater(Joi.ref('tanggal_mulai')).optional(),
  kriteria: Joi.object().optional()
});
