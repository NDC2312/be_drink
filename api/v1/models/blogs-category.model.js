const mongoose = require("mongoose");
var slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const blogsCategorySchema = new mongoose.Schema(
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

const blogsCategory = mongoose.model(
  "blog-category",
  blogsCategorySchema,
  "blogs-category"
);
module.exports = blogsCategory;
