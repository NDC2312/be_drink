const Review = require("../models/review.model");

// [GET] api/v1/review
module.exports.index = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };
    const review = await Review.find(find);
    res.json(review);
  } catch (error) {
    res.json({
      code: 400,
      message: "Them danh gia that bai",
    });
  }
};

// [POST] api/v1/create
module.exports.create = async (req, res) => {
  try {
    const data = {
      isRating: true,
      ...req.body,
    };
    const review = new Review(data);
    review.save();
    res.json({
      code: 200,
      message: "Đánh giá thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Them danh gia that bai",
    });
  }
};

// [PATCH] api/v1/delete
module.exports.delete = async (req, res) => {
  try {
    const review_id = req.params.review_id;
    await Review.updateOne(
      {
        _id: review_id,
      },
      {
        deleted: true,
      }
    );
    res.json({
      code: 200,
      message: "Xoa dánh giá thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Them danh gia that bai",
    });
  }
};
