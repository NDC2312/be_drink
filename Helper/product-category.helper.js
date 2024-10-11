const ProductCategory = require("../api/v1/models/products-category.model");

module.exports.getSubCategory = async (parentId) => {
  const getCategory = async (parentId) => {
    const subs = await ProductCategory.find({
      parent_id: parentId,
      status: "active",
      deleted: false,
    });
    let allSub = [...subs];
    for (const sub of subs) {
      const child = await getCategory(sub.id);
      allSub = allSub.concat(child);
    }
    return allSub;
  };
  const res = await getCategory(parentId);
  return res;
};
