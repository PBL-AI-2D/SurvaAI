import Joi from 'joi';

export const sendOpinionEmailSchema = Joi.object({
  email: Joi.string().required(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
}); 
