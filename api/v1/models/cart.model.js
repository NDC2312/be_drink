const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: String,
    products: [
      {
        product_id: String,
        quantity: Number,
      },
    ],
    deleted: false,
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("cart", cartSchema, "carts");

module.exports = Cart;
