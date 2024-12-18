const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: String,
    cart_id: String,
    userInfo: {
      email: String,
      fullName: String,
      phone: String,
      address: String,
      note: String,
    },
    products: [
      {
        product_id: String,
        title: String,
        price: Number,
        discountPercentage: Number,
        quantity: Number,
      },
    ],
    totalPrice: Number,

    status: {
      type: String,
      default: "spending",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", orderSchema, "orders");

module.exports = Order;
