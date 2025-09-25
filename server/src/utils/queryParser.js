export const parseQuery = (query = {}, options = {}) => {
  const {
    defaultSort = '-created_at',
    allowedFilters = [],
    maxLimit = 1000,
    defaultLimit = 10
  } = options;

  const page = Math.max(Number.parseInt(query.page) || 1, 1);
  const limit = Math.min(
    parseInt(query.limit) || defaultLimit, 
    maxLimit
  );

  const sortParam = query.sort || defaultSort;
  const [sortField, sortOrder] = sortParam.startsWith('-') 
    ? [sortParam.slice(1), 'DESC'] 
    : [sortParam, 'ASC'];

  const where = allowedFilters.reduce((acc, filter) => {
    if (query[filter] !== undefined) {
      acc[filter] = query[filter];
    }
    return acc;
  }, {});

  return {
    pagination: {
      offset: (page - 1) * limit,
      limit,
      page
    },
    order: [[sortField, sortOrder]],
    where,
    rawQuery: query
  };
};

export const metaQueryFormat = (result, options = {}) => ({
  meta: {
    total_items: result.count,
    total_pages: Math.ceil(result.count / options.limit),
    current_page: options.page,
    per_page: options.limit
  }
});
