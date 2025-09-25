import Joi from 'joi';

export const loginValidation = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).required(),
  remember_me: Joi.boolean().optional(),
});

export const emailRegisterValidation = Joi.object({
  email: Joi.string().email().max(255).required(),
});

export const verifyOTPValidation = Joi.object({
  email: Joi.string().email().max(255).required(),
  otp: Joi.string().length(6).required()
});

export const completeAccountValidation = Joi.object({
  register_token: Joi.string().required(),
  password: Joi.string().min(8).required(),
  nama: Joi.string().required(),
  profil_responden: Joi.object().optional(),
  profil_klien: Joi.object().optional()
});
