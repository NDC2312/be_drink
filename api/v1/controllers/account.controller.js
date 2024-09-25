const Account = require("../models/account.model");
const Role = require("../models/role.model");
const generateHeper = require("../../../Helper/generate.helper");
const md5 = require("md5");

// [POST] api/v1/account/register
module.exports.register = async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);
  const user = await Account.findOne({
    email: email,
    deleted: false,
  });
  console.log(user);

  if (user) {
    res.json({
      code: 400,
      message: "Email này đã tồn tại",
    });
  } else {
    const account = new Account({
      fullName: req.body.fullName,
      email: email,
      password: password,
      token: generateHeper.generateString(20),
      avatar: req.body.avatar,
      role_id: req.body.role_id,
      phone: req.body.phone,
      status: req.body.status,
    });

    await account.save();

    const token = account.token;
    res.cookie("token", token);

    res.json({
      code: 200,
      message: "Tạo tài khoản thành công.",
      token: token,
    });
  }
};

// [POST] api/v1/account/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);

  const user = await Account.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    res.json({
      code: 400,
      message: "Email này không tồn tại",
    });
    return;
  }

  if (md5(password) !== user.password) {
    res.json({
      code: 400,
      message: "Mật khẩu không chính xác.",
    });
    return;
  }
  const permissions = await Role.findOne({
    _id: user.role_id,
  }).select("permissions");

  const token = user.token;

  res.cookie("token", token);

  res.json({
    code: 200,
    message: "Đăng nhập thành công.",
    token: token,
    permissions: permissions.permissions,
    user: user._id,
  });
};

module.exports.myAccount = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    let user = await Account.findOne({
      token: token,
      deleted: false,
    }).select("-password -token");

    const role = await Role.findOne({
      _id: user.role_id,
      deleted: false,
    });
    user.roleTitle = role.title;
    user = {
      ...user.toJSON(),
      roleTitle: user.roleTitle,
    };
    res.json(user);
  } catch (error) {
    res.json({
      code: 400,
      message: "Vui lòng gửi kèm theo token",
    });
  }
};

// [GET] api/v1/account/

// [GET] api/v1/account
module.exports.index = async (req, res) => {
  try {
    const accounts = await Account.find({
      deleted: false,
    }).select("-password -token");

    for (const account of accounts) {
      const role = await Role.findOne({
        _id: account.role_id,
        deleted: false,
      });
      account.roleTitle = role.title;
    }

    const newAccounts = accounts.map((account) => {
      return {
        ...account.toJSON(),
        roleTitle: account.roleTitle,
      };
    });

    res.json(newAccounts);
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy thông tin người dùng thất bại.",
    });
  }
};

// [GET] api/v1/account/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const account = await Account.find({
      _id: id,
      deleted: false,
    }).select("-password -token");
    res.json(account);
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy thông tin thất bại.",
    });
  }
};

// [PATCH] api/v1/account/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const account = await Account.findOne({
      _id: { $ne: id },
      email: req.body.email,
      deleted: false,
    });
    if (account) {
      res.json({
        code: 400,
        message: `Email: ${req.body.email} này đã tồn tại.`,
      });
    } else {
      if (req.body.password) {
        req.body.password = md5(req.body.password);
      } else {
        delete req.body.password;
      }
      await Account.updateOne(
        {
          _id: id,
        },
        req.body
      );
      res.json({
        code: 200,
        message: "cập nhật thành công.",
      });
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật thất bại.",
    });
  }
};

// [PATCH] api/v1/account/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Account.updateOne(
      {
        _id: id,
      },
      { deleted: true }
    );
    res.json({
      code: 200,
      message: "Xóa tài khoản khoản thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xóa tài khoản khoản thất bại.",
    });
  }
};

// [PATCH] api/v1/account/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await Account.updateOne(
      {
        _id: id,
      },
      {
        status: status,
      }
    );
    res.json({
      code: 200,
      message: "Cập nhập trạng thái thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhập thất bại.",
    });
  }
};

// [PATCH] api/v1/account/change-multi/
module.exports.changeMulti = async (req, res) => {
  const { ids, type, value } = req.body;

  switch (type) {
    case "status":
      await Account.updateMany(
        {
          _id: { $in: ids },
        },
        { status: value }
      );
      res.json({
        code: 200,
        message: `Đã cập nhập trạng thái thành công ${ids.length} sản phẩm.`,
      });
      break;
    case "delete":
      await Account.updateMany(
        {
          _id: { $in: ids },
        },
        {
          deletedAt: new Date(),
          deleted: true,
        }
      );
      res.json({
        code: 200,
        message: `Đã xóa thành công ${ids.length} sản phẩm.`,
      });
      break;
    default:
      res.json({
        code: 400,
        message: "Cập nhập thất bại.",
      });
      break;
  }
};
