import Joi from 'joi';

function getDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
const minStartDate = getDateOnly(new Date(Date.now() + 0 * 86400000))

export const createSurveiSchema = Joi.object({
  id_umum: Joi.string().uuid().required(),
  judul: Joi.string().max(255).required(),
  deskripsi: Joi.string().allow('').optional(),
  jumlah_responden: Joi.number().integer().min(1).max(1000).required(),
  tanggal_mulai: Joi.date().iso().min(minStartDate),
  tanggal_berakhir: Joi.date().iso().required().greater(Joi.ref('tanggal_mulai')),
  kriteria: Joi.object().optional()
});

export const updateSurveiSchema = Joi.object({
  judul: Joi.string().max(255).optional(),
  deskripsi: Joi.string().allow('').optional(),
  status: Joi.string().valid('draft', 'under_review', 'payment_pending', 'published', 'closed', 'archived', 'rejected').optional(),
  jumlah_responden: Joi.number().integer().min(1).max(1000).optional(),
  tanggal_mulai: Joi.date().iso().optional(),
  tanggal_berakhir: Joi.date().iso().greater(Joi.ref('tanggal_mulai')).optional(),
  hadiah_poin: Joi.number().integer().min(0).default(0),
  kriteria: Joi.object().optional(),
});
