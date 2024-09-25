const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    description: String,
    status: String,
    agreeAt: {
      account_id: String,
      created: Date,
    },
    position: Number,
    deleteAt: {
      account_id: String,
      deleted: Date,
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

const Customer = mongoose.model("customer", customerSchema, "customers");
module.exports = Customer;
