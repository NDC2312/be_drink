const Blog = require("../models/blog.model");
const searchHelpers = require("../../../Helper/search.helper");
const paginationHelpers = require("../../../Helper/pagination.helper");
const Account = require("../models/account.model");

// [GET] api/v1/blog
module.exports.index = async (req, res) => {
  try {
    let find = {
      deleted: false,
    };

    if (req.query.status) {
      find.status = req.query.status;
    }

    if (req.query.keyword) {
      const search = searchHelpers(req.query);
      find.title = search.regex;
    }

    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else sort.position = "desc";

    // pagination
    const countBlogs = await Blog.countDocuments(find);
    const objectPagination = paginationHelpers(
      {
        currentPage: 1,
        limitProduct: 21,
      },
      req.query,
      countBlogs
    );

    const blogs = await Blog.find(find)
      .sort(sort)
      .limit(objectPagination.limitProduct)
      .skip(objectPagination.skip);

    for (const blog of blogs) {
      const account = await Account.findOne({
        _id: blog.author.account_id,
      });
      if (account) {
        blog.accountFullName = account.fullName;
      }

      const updateBy = blog.updateBy.slice(-1)[0];
      if (updateBy) {
        const updateAccount = await Account.findOne({
          _id: updateBy.account_id,
        });
        if (updateAccount) {
          blog.updateBy.updateFullName = updateAccount.fullName;
        }
      }
    }

    const newBlogs = blogs.map((blog) => {
      return {
        ...blog.toJSON(),
        accountFullName: blog.accountFullName,
        updateFullName: blog.updateBy.updateFullName,
      };
    });
    res.json({ newBlogs, countBlogs });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thất bại.",
    });
  }
};

// [POST] api/v1/blog/create
module.exports.create = async (req, res) => {
  try {
    if (req.body.position == "") {
      req.body.position = (await Blog.countDocuments()) + 1;
    } else req.body.position = req.body.position;
    req.body.author = {
      account_id: req.user._id,
    };
    const blog = await new Blog(req.body);
    blog.save();
    res.json({
      code: 200,
      message: "Tạo bài viết thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Tạo bài viết thất bại.",
    });
  }
};

// [PATCH] api/v1/blog/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
    };
    const updateBy = {
      account_id: req.user._id,
    };
    console.log(updateBy);
    const blog = await Blog.updateOne(find, {
      ...req.body,
      $push: { updateBy: updateBy },
    });
    console.log(blog);

    res.json({
      code: 200,
      message: "Cập nhật bài viết thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật bài viết thất bại.",
    });
  }
};

// [GET] api/v1/blog/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
      deleted: false,
    };
    const blog = await Blog.findOne(find);
    res.json(blog);
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi.",
    });
  }
};

// [PATCH] api/v1/blog/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
      deleted: false,
    };
    const deleteBy = {
      account_id: req.user._id,
      deletedAt: new Date(),
    };
    await Blog.updateOne(find, {
      deleted: true,
      $push: { deleteBy: deleteBy },
    });
    res.json({
      code: 200,
      message: "Xóa bài viết thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xóa bài viết thất bại .",
    });
  }
};

// [PATCH] api/v1/blog/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;
    let find = {
      _id: id,
      deleted: false,
    };
    await Blog.updateOne(find, {
      status: status,
    });
    res.json({
      code: 200,
      message: "Thay đổi trạng thái bài viết thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thay đổi trạng thái bài viết thất bại.",
    });
  }
};

// // [PATCH] api/v1/blog/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;

    switch (key) {
      case "status":
        await Blog.updateMany(
          {
            _id: { $in: ids },
          },
          {
            status: value,
          }
        );
        res.json({
          code: 200,
          message: `Thay đổi trạng thái thành công ${ids.length} bài viết`,
        });
        break;
      case "delete":
        await Blog.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: true,
          }
        );
        res.json({
          code: 200,
          message: `Xóa thành công ${ids.length} bài viết`,
        });
        break;
      case "change-position":
        for (const item of ids) {
          let [id, position] = item.split("-");
          position = parent(position);
          await Blog.updateOne(
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
          message: `Thay đổi thành công ${ids.length} vị trí bài viết`,
        });
        break;
      default:
        res.json({
          code: 400,
          message: "Thất bại.",
        });
        break;
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "Thất bại.",
    });
  }
};
