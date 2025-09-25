import Joi from 'joi';

export const createPenukaranHadiahSchema = Joi.object({
	id_hadiah: Joi.string().uuid().required(),
});
