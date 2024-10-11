const paginationHelpers = require("../../../Helper/pagination.helper");
const Products = require("../models/products.model");
const ProductsCategory = require("../models/products-category.model");
const ProductHelper = require("../../../Helper/product.helper");
const productCategoryHelper = require("../../../Helper/product-category.helper");
const createTree = require("../../../Helper/createTree.helper");

// [GET] api/v1/products
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
    status: "active",
  };
  // pagination
  const countProducts = await Products.countDocuments(find);
  const objectPagination = paginationHelpers(
    {
      currentPage: 1,
      limitProduct: 9,
    },
    req.query,
    countProducts
  );
  // -- end pagination --
  const products = await Products.find(find)
    .sort({ position: "desc" })
    .limit(objectPagination.limitProduct)
    .skip(objectPagination.skip);

  const newProducts = ProductHelper.priceNewProducts(products);
  res.json({ products: newProducts, countTotalPage: countProducts });
};

// [GET] api/v1/products-category
module.exports.productCategory = async (req, res) => {
  const productCategory = await ProductsCategory.find({
    deleted: false,
    status: "active",
  });
  const tree = createTree.tree(productCategory);
  res.json(tree);
};

// [GET] api/v1/products/featured
module.exports.featured = async (req, res) => {
  let find = {
    deleted: false,
    featured: true,
  };

  // pagination
  const countProducts = await Products.countDocuments(find);
  const objectPagination = paginationHelpers(
    {
      currentPage: 1,
      limitProduct: 8,
    },
    req.query,
    countProducts
  );
  // -- end pagination --
  const products = await Products.find(find)
    .limit(objectPagination.limitProduct)
    .skip(objectPagination.skip);
  const newProducts = ProductHelper.priceNewProducts(products);
  res.json({ products: newProducts, countTotalPage: countProducts });
};

// [GET] api/v1/products/category
module.exports.category = async (req, res) => {
  console.log(req.params.slugCategory);
  let find = {
    deleted: false,
    status: "active",
    slug: req.params.slugCategory,
  };
  const category = await ProductsCategory.findOne(find);
  const listSubCategory = await productCategoryHelper.getSubCategory(
    category.id
  );
  const listSubCategoryId = listSubCategory.map((item) => item.id);
  const products = await Products.find({
    product_category_id: { $in: category.id, ...listSubCategoryId },
    status: "active",
    deleted: false,
  }).sort({ position: "desc" });
  const newProducts = ProductHelper.priceNewProducts(products);
  res.json(newProducts);
};

// [GET] api/v1/products/detail
module.exports.detail = async (req, res) => {
  console.log(req.params.slugProduct);
  let find = {
    status: "active",
    deleted: false,
    slug: req.params.slugProduct,
  };
  const product = await Products.findOne(find);
  product.priceNew = ProductHelper.priceNewProduct(product);
  const NewProduct = {
    ...product.toObject(),
    priceNew: product.priceNew,
  };
  res.json(NewProduct);
};
