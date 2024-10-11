const mongoose = require("mongoose");
var slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

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
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
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
