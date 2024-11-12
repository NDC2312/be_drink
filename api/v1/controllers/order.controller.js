const Order = require("../models/order.model");
const Product = require("../models/products.model");
const productsHelper = require("../../../Helper/product.helper");
const searchHelpers = require("../../../Helper/search.helper");
const paginationHelpers = require("../../../Helper/pagination.helper");

// [GET] api/v1/order
module.exports.index = async (req, res) => {
  try {
    let find = {
      deleted: false,
    };
    if (req.query.status) {
      find.status = req.query.status;
    }
    // sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else sort.position = "desc";
    // -- end sort --
    // search
    const objectSearch = searchHelpers(req.query);
    if (req.query.keyword) {
      find._id = objectSearch.regex;
    }
    // -- end search --
    // pagination
    const countProducts = await Order.countDocuments(find);
    const objectPagination = paginationHelpers(
      {
        currentPage: 1,
        limitProduct: 12,
      },
      req.query,
      countProducts
    );

    // -- end pagination --
    const cart = await Order.find(find)
      .sort(sort)
      .limit(objectPagination.limitProduct)
      .skip(objectPagination.skip);

    res.json(cart);
  } catch (error) {
    res.json({
      code: 400,
      message: "Không lấy được dữ liệu",
    });
  }
};

// [PATCH] api/v1/order/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await Order.updateOne(
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

// [PATCH] api/v1/order/change-multi/
module.exports.changeMulti = async (req, res) => {
  const { ids, type, value } = req.body;

  switch (type) {
    case "status":
      await Order.updateMany(
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
      await Order.updateMany(
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
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Order.updateOne(
          {
            _id: id,
          },
          {
            position: position,
          }
        );
      }
      res.json({
        code: 200,
        message: `Đã cập nhập thành công vị trí của ${ids.length} sản phẩm.`,
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

// [GET] api/v1/order/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
      deleted: false,
    };
    const product = await Order.findOne(find);
    res.json(product);
  } catch (error) {
    res.json({
      code: 400,
      message: "Không tìm thấy sản phẩm",
    });
  }
};

// [PATCH] api/v1/order/delete/:id
// module.exports.delete = async (req, res) => {
//   try {
//     const id = req.params.id;
//     await Order.updateOne(
//       {
//         _id: id,
//       },
//       {
//         status: "spending",
//       }
//     );
//     res.json({
//       code: 200,
//       message: "Hủy đơn hàng thành công.",
//     });
//   } catch (error) {
//     res.json({
//       code: 400,
//       message: "Hủy thất bại.",
//     });
//   }
// };
