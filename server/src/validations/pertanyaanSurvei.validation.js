import Joi from 'joi';

const validTipe = ['pilihan_ganda', 'essay', 'checkbox', 'dropdown', 'skala'];
const validVisualisasi = ['pie', 'bar', 'doughnut', 'radar', 'text', 'wordcloud', 'sentiment_analysis'];

export const createPertanyaanSurveiSchema = Joi.object({
  teks_pertanyaan: Joi.string().min(3).max(500).required(),
  tipe_pertanyaan: Joi.string().valid(...validTipe).default('pilihan_ganda'),
  opsi: Joi.when('tipe_pertanyaan', {
    is: Joi.not('essay'),
    then: Joi.array().min(1).required(),
    otherwise: Joi.optional()
  }),
  is_required: Joi.boolean().default(true),
  tipe_visualisasi: Joi.alternatives().conditional('tipe_pertanyaan', {
    is: 'essay',
    then: Joi.string().valid(...validVisualisasi).default('text'),
    otherwise: Joi.string().valid(...validVisualisasi).default('pie')
  })
});

export const updatePertanyaanSurveiSchema = Joi.object({
  teks_pertanyaan: Joi.string().min(3).max(500).optional(),
  tipe_pertanyaan: Joi.string().valid(...validTipe).optional(),
  opsi: Joi.when('tipe_pertanyaan', {
    is: Joi.not('essay'),
    then: Joi.array().min(1).required(),
    otherwise: Joi.optional()
  }),
  is_required: Joi.boolean().optional(),
  tipe_visualisasi: Joi.alternatives().conditional('tipe_pertanyaan', {
    is: 'essay',
    then: Joi.string().valid(...validVisualisasi).default('text'),
    otherwise: Joi.string().valid(...validVisualisasi).default('pie')
  })
});
