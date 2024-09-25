const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    token: String,
    avatar: String,
    role_id: String,
    phone: String,
    status: String,
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

const Account = mongoose.model("account", accountSchema, "accounts");
module.exports = Account;
