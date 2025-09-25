export const resSuccess = (res, message, payload = null, code = 200) => {
  const responseBody = {
    status: 'success',
    message,
  };

  if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.meta !== undefined && payload.data !== undefined) {
    res.status(code).json({
      ...responseBody,
      data: payload.data,
      meta: payload.meta
    });
  } else {
    res.status(code).json({
      ...responseBody,
      data: payload
    });
  }
};

export const resFail = (res, message, code = 400) => {
  res.status(code).json({
    status: 'fail',
    message
  });
};
