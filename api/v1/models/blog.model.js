const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    content: String,
    position: Number,
    thumbnail: String,
    status: String,
    // keyword: [{ type: String }],
    // tag: [{ type: String }],
    blog_parent_id: {
      type: String,
      default: "",
    },
    author: {
      account_id: String,
    },
    updateBy: [
      {
        account_id: String,
      },
    ],
    deleteBy: {
      account_id: String,
      deletedAt: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("blog", blogSchema, "blogs");
module.exports = Blog;
