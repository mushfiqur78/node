const parsePagination = (query) => {
  const page    = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit   = Math.min(100, parseInt(query.limit, 10) || 20);
  const skip    = (page - 1) * limit;
  const sortBy  = query.sortBy  || 'createdAt';
  const sortDir = query.sortDir === 'asc' ? 1 : -1;
  return { page, limit, skip, sort: { [sortBy]: sortDir } };
};

const buildMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

module.exports = { parsePagination, buildMeta };
