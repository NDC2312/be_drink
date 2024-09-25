module.exports = (objectPagination, query, countProduct) => {
  if (query.page) {
    objectPagination.currentPage = parseInt(query.page);
  }
  objectPagination.skip =
    (objectPagination.currentPage - 1) * objectPagination.limitProduct;

  const totalPage = Math.ceil(countProduct / objectPagination.limitProduct);

  objectPagination.totalPage = totalPage;

  return objectPagination;
};
