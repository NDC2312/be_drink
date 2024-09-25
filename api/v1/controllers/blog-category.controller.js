const BlogCategory = require("../models/blogs-category.model");
const createTreeHelper = require("../../../Helper/createTree.helper");
const searchHelpers = require("../../../Helper/search.helper");

// [GET] api/v1/blogs-category/
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
      find.title = objectSearch.regex;
    }
    // -- end search --

    const blogCategory = await BlogCategory.find(find).sort(sort);
    const newBlogCategory = createTreeHelper.tree(blogCategory);

    const createTree = (data) => {
      const results = [];
      data.forEach((item) => {
        const newItem = item._doc;
        if (item.children) {
          newItem.children = createTree(item.children);
        }
        results.push(newItem);
      });
      return results;
    };
    const tree = createTree(newBlogCategory);
    res.json(tree);
  } catch (error) {
    res.json({
      code: 400,
      message: "Thất bại.",
    });
  }
};

// [POST] api/v1/blogs-category/create
module.exports.create = async (req, res) => {
  try {
    if (req.body.position == "") {
      req.body.position = (await BlogCategory.countDocuments()) + 1;
    } else req.body.position = req.body.position;
    const blog = await new BlogCategory(req.body);
    await blog.save();
    res.json({
      code: 200,
      message: "Tạo danh mục bài viết thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Tạo danh mục bài viết thất bại.",
    });
  }
};

// [PATCH] api/v1/blogs-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    await BlogCategory.updateOne({ _id: id }, req.body);
    res.json({
      code: 200,
      message: "Cập nhật danh mục bài viết thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thất bại.",
    });
  }
};

// [GET] api/v1/blogs-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await BlogCategory.findOne({ _id: id });
    res.json(blog);
  } catch (error) {
    res.json({
      code: 400,
      message: "Thất bại.",
    });
  }
};

// [PATCH] api/v1/blogs-category/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await BlogCategory.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      }
    );
    res.json({
      code: 200,
      message: "Xóa sản bài viết công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xóa thất bại.",
    });
  }
};

// [PATCH] api/v1/blogs-category/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const value = req.body.status;
    await BlogCategory.updateOne(
      {
        _id: id,
      },
      {
        status: value,
      }
    );
    res.json({
      code: 200,
      message: "Cập nhật trạng thái thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thay đổi trạng thái thất bại.",
    });
  }
};

// [PATCH] api/v1/blogs-category/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;
    console.log(ids);
    switch (key) {
      case "status":
        await BlogCategory.updateMany(
          {
            _id: { $in: ids },
          },
          {
            status: value,
          }
        );
        res.json({
          code: 200,
          message: `cập nhật thành công ${ids.length} sản phẩm. `,
        });
        break;

      case "delete":
        await BlogCategory.updateMany(
          {
            _id: { $in: ids },
          },
          {
            deleted: true,
          }
        );
        res.json({
          code: 200,
          message: `Xóa thành công ${ids.length} sản phẩm. `,
        });
        break;

      case "change-position":
        for (const item of ids) {
          const [id, position] = item.split("-");
          parseInt(position);
          await BlogCategory.updateOne(
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
          message: `Cập nhật thành công ${ids.length} vị trí sản phẩm.`,
        });
        break;

      default:
        res.json({
          code: 400,
          message: `Cập nhật thất bại ${ids.length} sản phẩm.`,
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
