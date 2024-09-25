const mongoose = require("mongoose");

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
