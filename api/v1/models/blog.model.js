const mongoose = require("mongoose");
var slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

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

const Blog = mongoose.model("blog", blogSchema, "blogs");
module.exports = Blog;
