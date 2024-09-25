const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    title: String,
    parent_id: {
      type: String,
      default: "",
    },
    thumbnail: String,
    description: String,
    position: Number,
    status: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  },
  {
    timestamps: true,
  }
);
const ProductCategory = mongoose.model(
  "productCategory",
  productCategorySchema,
  "productCategory"
);
module.exports = ProductCategory;
