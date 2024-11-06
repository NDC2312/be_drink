const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    email: String,
    fullName: String,
    googleId: {
      type: String,
      default: "",
    },
    password: String,
    picture: String,
    tokenAuth: String,
    phone: String,
    linkedAuth: {
      google: {
        type: Boolean,
        default: false,
      },
      password: {
        type: Boolean,
        default: false,
      },
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

const Auth = mongoose.model("auth", authSchema, "auths");
module.exports = Auth;
