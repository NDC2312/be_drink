const Auth = require("../models/auth.model");
const Order = require("../models/order.model");
const ForgotPassword = require("../models/forgot-password.model");

const generateHeper = require("../../../Helper/generate.helper");
const sendMailHeper = require("../../../Helper/sendMail");

const md5 = require("md5");

const { OAuth2Client } = require("google-auth-library");
const client_id = process.env.GG_CLIENT_ID;
const client = new OAuth2Client(client_id);

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id,
  });
  const payload = ticket.getPayload();
  return payload;
}

module.exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  const payload = await verifyToken(token);

  const { email, name, sub, picture } = payload;
  let auth = await Auth.findOne({
    email,
    googleId: sub,
  });
  if (!auth) {
    auth = await Auth.create({
      email: email,
      fullName: name,
      tokenAuth: generateHeper.generateString(20),
      googleId: sub,
      picture: picture,
      linkedAuth: { google: true, password: false },
    });
  } else {
    if (!auth.googleId) {
      auth.googleId = sub;
      auth.linkedAuth.google = true;
    }
    await auth.save();
  }
  return res.json({
    code: 200,
    message: "Success",
  });
};

// [POST] api/v1/auth/register
module.exports.register = async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);
  let auth = await Auth.findOne({
    email: email,
    deleted: false,
  });
  if (auth) {
    if (auth.linkedAuth.google) {
      auth.fullName = req.body.fullName;
      auth.phone = req.body.phone;
      auth.linkedAuth.password = true;
      await auth.save();
      const tokenAuth = auth.tokenAuth;
      res.cookie("tokenAuth", tokenAuth);
      res.json({
        code: 200,
        message: "Tạo tài khoản thành công.",
        tokenAuth: tokenAuth,
      });
      return;
    } else {
      res.json({
        code: 400,
        message: "Email này đã tồn tại",
      });
    }
  } else {
    const user = new Auth({
      email: email,
      password: password,
      fullName: req.body.fullName,
      tokenAuth: generateHeper.generateString(20),
      picture: "",
      phone: req.body.phone,
      linkedAuth: { google: false, password: true },
    });
    await user.save();
    const tokenAuth = user.tokenAuth;
    res.cookie("tokenAuth", tokenAuth);
    res.json({
      code: 200,
      message: "Tạo tài khoản thành công.",
      tokenAuth: tokenAuth,
    });
  }
};

// [POST] api/v1/auth/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);

  const user = await Auth.findOne({
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

  const tokenAuth = user.tokenAuth;

  res.cookie("tokenAuth", tokenAuth);

  res.json({
    code: 200,
    message: "Đăng nhập thành công.",
    tokenAuth: tokenAuth,
    user: user._id,
  });
};

// [GET] api/v1/auth/myAuth
module.exports.myAuth = async (req, res) => {
  try {
    const tokenAuth = req.headers.authorization.split(" ")[1];
    const auth = await Auth.findOne({
      tokenAuth: tokenAuth,
    }).select("-password -tokenAuth");

    const order = await Order.find({
      user_id: auth._id,
    }).sort({ createdAt: -1 });
    order.totalOrder = order.length || 0;
    order.totalPrice = order.reduce((sum, item) => sum + item.totalPrice, 0);
    res.json({
      auth,
      order,
      totalOrder: order.totalOrder,
      totalPrice: order.totalPrice,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi, token.",
    });
  }
};

// [GET] api/v1/auth/index
module.exports.index = async (req, res) => {
  try {
    const auths = await Auth.find({
      deleted: false,
    }).select("-password -tokenAuth");

    res.json(auths);
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy thông tin người dùng thất bại.",
    });
  }
};

// [GET] api/v1/auth/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const auth = await Auth.find({
      _id: id,
      deleted: false,
    }).select("-password -tokenAuth");
    res.json(auth);
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy thông tin thất bại.",
    });
  }
};

// [PATCH] api/v1/auth/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const auth = await Auth.findOne({
      _id: { $ne: id },
      email: req.body.email,
      deleted: false,
    });
    if (auth) {
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
      await Auth.updateOne(
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

// [PATCH] api/v1/auth/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Auth.updateOne(
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

// // [PATCH] api/v1/account/change-status/:id
// module.exports.changeStatus = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const status = req.body.status;

//     await Account.updateOne(
//       {
//         _id: id,
//       },
//       {
//         status: status,
//       }
//     );
//     res.json({
//       code: 200,
//       message: "Cập nhập trạng thái thành công.",
//     });
//   } catch (error) {
//     res.json({
//       code: 400,
//       message: "Cập nhập thất bại.",
//     });
//   }
// };

// // [PATCH] api/v1/account/change-multi/
// module.exports.changeMulti = async (req, res) => {
//   const { ids, type, value } = req.body;

//   switch (type) {
//     case "status":
//       await Account.updateMany(
//         {
//           _id: { $in: ids },
//         },
//         { status: value }
//       );
//       res.json({
//         code: 200,
//         message: `Đã cập nhập trạng thái thành công ${ids.length} sản phẩm.`,
//       });
//       break;
//     case "delete":
//       await Account.updateMany(
//         {
//           _id: { $in: ids },
//         },
//         {
//           deletedAt: new Date(),
//           deleted: true,
//         }
//       );
//       res.json({
//         code: 200,
//         message: `Đã xóa thành công ${ids.length} sản phẩm.`,
//       });
//       break;
//     default:
//       res.json({
//         code: 400,
//         message: "Cập nhập thất bại.",
//       });
//       break;
//   }
// };

// [POST] api/v1/user/password/forgotPassword
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  const user = await Auth.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
    res.json({
      code: 400,
      message: "Email khong ton tai",
    });
    return;
  }
  // Luu thong tin vao DB
  const otp = generateHeper.generateRandomNumber(4);
  const timeExpire = 5;

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + timeExpire * 60 * 1000,
  };
  const forgotPassword = new ForgotPassword(objectForgotPassword);

  await forgotPassword.save();
  // Gui ma OTP qua user
  // Neu ton tai email thi gui mai qua OTP qua email
  const subject = "Ma OTP xac minh lay lai mat khau";
  const html = `
       Ma OTP de lay lai mat khau <b>${otp}</b>. Thoi han su dung la 3p
   `;

  sendMailHeper.sendMail(email, subject, html);
  res.json({
    code: 200,
    message: "Da gui ma OTP qua email",
  });
};

// [POST] api/v1/user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    res.json({
      code: 400,
      message: "Ma otp khong hop le",
    });
    return;
  }
  const user = await Auth.findOne({
    email: email,
  });
  const tokenAuth = user.tokenAuth;
  res.cookie("token", tokenAuth);
  res.json({
    code: 200,
    message: "xac thuc thanh cong",
    tokenAuth: tokenAuth,
  });
};

// [POST] api/v1/user/password/reset
module.exports.resetPassword = async (req, res) => {
  const tokenAuth = req.body.tokenAuth;
  const password = req.body.password;
  console.log(password);
  const user = await Auth.findOne({
    tokenAuth: tokenAuth,
  });

  if (md5(password) === user.password) {
    res.json({
      code: 400,
      message: "Vui long khong nhap mat khau cu",
    });
    return;
  }
  console.log(user);
  await Auth.updateOne(
    {
      tokenAuth: tokenAuth,
    },
    {
      password: md5(password),
    }
  );
  res.json({
    code: 200,
    message: "Doi mat khau thanh cong",
  });
};
