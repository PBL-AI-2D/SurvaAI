import Joi from 'joi';

export const createPenukaranHadiahSchema = Joi.object({
  id_umum: Joi.string().uuid().required(),
  id_hadiah: Joi.string().uuid().required(),
});
