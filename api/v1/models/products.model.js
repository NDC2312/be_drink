const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: String,
    status: String,
    description: String,
    product_category_id: {
      type: String,
      default: "",
    },
    price: Number,
    discountPercentage: Number,
    thumbnail: String,
    demo_url: String,
    position: Number,
    createBy: {
      account_id: String,
      createdAt: Date,
    },
    updateBy: [
      {
        account_id: String,
        updateAt: Date,
      },
    ],
    deleteBy: {
      account_id: String,
      deletedAt: Date,
    },
    featured: {
      type: Boolean,
      default: false,
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

const Products = mongoose.model("products", productSchema, "products");

module.exports = Products;
