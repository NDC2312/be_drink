const Account = require("../models/account.model");
const Role = require("../models/role.model");

module.exports.requireAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = await Account.findOne({
      token: token,
      deleted: false,
    }).select("-password");

    if (!user) {
      res.json({
        code: 400,
        message: "Vui lòng gửi kèm theo token",
      });
      return;
    }

    const role = await Role.findOne({
      _id: user.role_id,
    }).select("title permissions");

    req.user = user; // thac mac
    req.permissions = role.permissions;
    next();
  } else {
    res.json({
      code: 400,
      message: "Vui lòng gửi theo kèm token.",
    });
  }
};

const hasPermission = (req, permission) => {
  if (!req.permissions) return false;
  return req.permissions.includes(permission);
};

module.exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (hasPermission(req, permission)) {
      next();
    } else {
      res.status(403).send({
        message: "Bạn không có quyền truy cập đến tài nguyên này.",
      });
      return;
    }
  };
};
