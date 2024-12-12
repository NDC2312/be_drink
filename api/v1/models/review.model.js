const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // product_id: String,
    order_id: String,
    // user_id: String,
    rating: Number,
    comment: String,
    isRating: {
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

const Reviews = mongoose.model("review", reviewSchema, "reviews");

module.exports = Reviews;
