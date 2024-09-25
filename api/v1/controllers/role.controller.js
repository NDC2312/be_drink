const Role = require("../models/role.model");

// [GET] api/v1/role
module.exports.index = async (req, res) => {
  try {
    const find = { deleted: false };
    const role = await Role.find(find);
    res.json(role);
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy thông tin nhóm quyền thất bại",
    });
  }
};

// [GET] api/v1/role/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const role = await Role.find({
      _id: id,
      deleted: false,
    });
    res.json(role);
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy thông tin thất bại.",
    });
  }
};

// [PATCH] api/v1/role/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne(
      {
        _id: id,
      },
      req.body
    );
    res.json({
      code: 200,
      message: "cập nhật thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật thất bại.",
    });
  }
};

// [PATCH] api/v1/role/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne(
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

// [POST] api/v1/role/create
module.exports.create = async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.json({
      code: 200,
      message: "Tạo nhóm quyền thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thất bại khi tạo nhóm quyền",
    });
  }
};

// [PATCH] api/v1/role/permissions
module.exports.permissions = async (req, res) => {
  try {
    const permissions = req.body;
    for (const item of permissions) {
      await Role.updateOne(
        {
          _id: item.id,
        },
        {
          permissions: item.permissions,
        }
      );
    }
    res.json({
      code: 200,
      message: "Cập nhật thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật thất bại.",
    });
  }
};
