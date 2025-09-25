export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      status: 'validation_error',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
    });
  }

  req.body = value;
  next();
};
