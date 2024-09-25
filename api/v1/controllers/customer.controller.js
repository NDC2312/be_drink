const Customer = require("../models/customer.model");

const searchHelpers = require("../../../Helper/search.helper");

// [GET] api/v1/customer
module.exports.index = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };

    if (req.query.status) {
      find.status = req.query.status;
    }

    if (req.query.keyword) {
      const search = searchHelpers(req.query);
      find.phone = search.regex;
    }

    const customer = await Customer.find(find).sort({ position: "desc" });
    const spending = {
      status: "spending",
    };
    const countSpending = await Customer.find(spending).countDocuments();

    res.json({ customer, countSpending });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy dữ liệu thất bại.",
    });
  }
};

// [POST] api/v1/customer/create
module.exports.create = async (req, res) => {
  try {
    const position = await Customer.countDocuments();
    req.body.position = position + 1;
    const customer = new Customer(req.body);
    await customer.save();
    res.json({
      code: 200,
      message: "Bạn đã gửi yêu cầu tư vấn thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Bạn đã gửi yêu cầu thất bại.",
    });
  }
};

// [PATCH] api/v1/customer/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const newStatus = req.body.status;
    await Customer.updateOne(
      {
        _id: id,
      },
      {
        status: newStatus,
        agreeAt: {
          account_id: req.user._id,
          created: new Date(),
        },
      }
    );
    res.json({
      code: 200,
      message: "Thay đổi trạng thái thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thay đổi trạng thái thất bại.",
    });
  }
};

// [PATCH] apu/v1/customer/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Customer.updateOne(
      {
        _id: id,
      },
      {
        deleteAt: {
          account_id: req.user._id,
          deleted: new Date(),
        },
        deleted: true,
      }
    );
    res.json({
      code: 200,
      message: "Xóa thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xóa không thành công.",
    });
  }
};
