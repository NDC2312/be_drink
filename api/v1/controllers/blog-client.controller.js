const Blog = require("../models/blog.model");
const BlogCategory = require("../models/blogs-category.model");
const paginationHelpers = require("../../../Helper/pagination.helper");
const productCategoryHelper = require("../../../Helper/product-category.helper");
const createTreeHelper = require("../../../Helper/createTree.helper");

// [GET] api/v1/products-category
module.exports.blogCategory = async (req, res) => {
  const productCategory = await BlogCategory.find({
    deleted: false,
    status: "active",
  });
  const productCategoryTree = createTreeHelper.tree(productCategory);
  const createTree = (data) => {
    const results = [];
    data.forEach((item) => {
      const newItem = item._doc;
      if (item.children) {
        newItem.children = createTree(item.children);
      }
      results.push(newItem);
    });
    return results;
  };
  const tree = createTree(productCategoryTree);
  res.json(tree);
};

// [GET] api/v1/products/category
module.exports.category = async (req, res) => {
  console.log("req.params.slugCategory", req.params.slugCategory);
  let find = {
    deleted: false,
    status: "active",
    slug: req.params.slugCategory,
  };
  const category = await BlogCategory.findOne(find);
  const listSubCategory = await productCategoryHelper.getSubCategory(
    category.id
  );
  const listSubCategoryId = listSubCategory.map((item) => item.id);
  const products = await Blog.find({
    blog_parent_id: { $in: [category.id, ...listSubCategoryId] },
    status: "active",
    deleted: false,
  }).sort({ position: "desc" });
  res.json(products);
};

// [GET] api/v1/products/detail
module.exports.detail = async (req, res) => {
  console.log(req.params.slugProduct);
  let find = {
    status: "active",
    deleted: false,
    slug: req.params.slugProduct,
  };
  const product = await Blog.findOne(find);

  res.json(product);
};
