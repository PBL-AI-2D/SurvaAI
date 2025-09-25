import Joi from 'joi';

export const createKonfigurasiHargaSchema = Joi.object({
  harga_dasar: Joi.number().precision(2).min(0).required(),
  harga_per_pertanyaan: Joi.number().precision(2).min(0).required(),
  harga_per_responden: Joi.number().precision(2).min(0).required(),
  harga_per_durasi: Joi.number().precision(2).min(0).required()
});

export const updateKonfigurasiHargaSchema = Joi.object({
  harga_dasar: Joi.number().precision(2).min(0),
  harga_per_pertanyaan: Joi.number().precision(2).min(0),
  harga_per_responden: Joi.number().precision(2).min(0),
  harga_per_durasi: Joi.number().precision(2).min(0)
});
