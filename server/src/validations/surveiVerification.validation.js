import Joi from 'joi';

export const verifySurveiByAdminSchema = Joi.object({
  approve: Joi.boolean().required(),
  umpan_balik: Joi.when('approve', {
    is: false,
    then: Joi.string().trim().min(1).required(),
    otherwise: Joi.forbidden()
  })
});
