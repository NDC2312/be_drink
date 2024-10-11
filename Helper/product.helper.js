module.exports.priceNewProducts = (products) => {
  const newProduct = products.map((item) => {
    return {
      ...item.toObject(),
      priceNew:
        Math.ceil(
          (item.price * ((100 - item.discountPercentage) / 100)) / 1000
        ) * 1000,
    };
  });
  return newProduct;
};

module.exports.priceNewProduct = (product) => {
  const priceNew = (product.price * (100 - product.discountPercentage)) / 100;
  const roundedPrice = Math.ceil(priceNew / 1000) * 1000;
  return roundedPrice;
};
