import Joi from 'joi';

export const saveDraftSchema = Joi.object({
  respon: Joi.object()
    .pattern(
      Joi.string().uuid().required(),
      Joi.alternatives().try(
        Joi.string().allow(''),
        Joi.number(),
        Joi.array().items(Joi.string()),
        Joi.boolean(),
        Joi.valid(null)
      )
    )
    .optional()
    .min(1)
});
