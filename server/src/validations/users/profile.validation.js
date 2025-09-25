import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  umum: Joi.object({
    nama: Joi.string().max(255).optional(),
    profil_responden: Joi.object().optional(),
    profil_klien: Joi.object().optional()
  }),

  admin: Joi.object({
    nama_admin: Joi.string().max(255).optional(),
    kontak_darurat: Joi.string().max(255).optional(),
  })
});
