const mongoose = require("mongoose");
const authSchema = new mongoose.Schema(
  {
    email: String,
    fullName: String,
    goggleId: String,
  },
  {
    timestamps: true,
  }
);

const Auth = mongoose.model("auth", authSchema, "auths");
module.exports = Auth;
