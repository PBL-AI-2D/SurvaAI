import Joi from 'joi';

const adminSchema = Joi.object({
  nama_admin: Joi.string().max(255).optional(),
  kontak_darurat: Joi.string().max(255).optional(),
}).optional();

const umumSchema = Joi.object({
  nama: Joi.string().max(255).optional(),
  profil_responden: Joi.object().optional(),
  profil_klien: Joi.object().optional(),
  poin: Joi.forbidden(),
}).optional();

export const createPenggunaSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(255).required(),
  role: Joi.string().valid('admin', 'umum').default('umum'),

  email_confirmed: Joi.forbidden(),
  email_confirmation_token: Joi.forbidden(),
  reauth_token: Joi.forbidden(),
  email_confirmation_sent_at: Joi.forbidden(),
  last_sign_in_at: Joi.forbidden(),
  reauth_sent_at: Joi.forbidden(),

  admin: Joi.when('role', {
    is: 'admin',
    then: adminSchema,
    otherwise: Joi.forbidden()
  }),
  umum: Joi.when('role', {
    is: 'umum',
    then: umumSchema,
    otherwise: Joi.forbidden()
  }),
});

export const updatePenggunaSchema = Joi.object({
  email: Joi.string().email().max(255).optional(),
  password: Joi.string().min(8).max(255).optional(),
  role: Joi.string().valid('admin', 'umum'),
  email_confirmed: Joi.boolean().optional(),

  admin: Joi.object({
    nama_admin: Joi.string().max(255).optional(),
    kontak_darurat: Joi.string().max(255).optional()
  }).optional(),

  umum: Joi.object({
    nama: Joi.string().max(255).optional(),
    profil_responden: Joi.object().optional(),
    profil_klien: Joi.object().optional()
  }).optional()
});
