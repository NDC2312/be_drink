const Cart = require("../models/cart.model");
const Product = require("../models/products.model");

const productsHelper = require("../../../Helper/product.helper");
// [GET] api/v1/cart
module.exports.index = async (req, res) => {
  try {
    const cart_id = req.cookies.cartId;
    let cart = await Cart.findOne({
      _id: cart_id,
    });
    if (cart.products.length > 0) {
      for (const item of cart.products) {
        const productId = item.product_id;
        const products = await Product.findOne({
          _id: productId,
          deleted: false,
        }).select("title thumbnail price slug discountPercentage");
        products.priceNew = productsHelper.priceNewProduct(products);
        item.productInfo = products;
        item.totalPrice = products.priceNew * item.quantity;
      }
    }
    cart.totalPrice = cart.products.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const productInfo = cart.products.map((item) => {
      return item.productInfo;
    });
    const updatedCartProducts = cart.products.map((item) => {
      return {
        ...item.toJSON(),
        productInfo: productInfo,
        totalPrice: item.totalPrice,
      };
    });

    res.json({
      _id: cart._id,
      products: updatedCartProducts,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Không tìm thấy giỏ hàng.",
    });
  }
};

// [POST] api/v1/cart/addCart
module.exports.addCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity);
    const cart_id = req.cookies.cartId;
    const cart = await Cart.findOne({
      _id: cart_id,
    });
    const existProductInCart = cart.products.find(
      (item) => item.product_id == productId
    );
    if (existProductInCart) {
      const quantityNew = quantity + existProductInCart.quantity;
      console.log(quantityNew);
      await Cart.updateOne(
        {
          _id: cart_id,
          "products.product_id": productId,
        },
        {
          $set: {
            "products.$.quantity": quantityNew,
          },
        }
      );
    } else {
      const objectCart = {
        product_id: productId,
        quantity: quantity,
      };
      await Cart.updateOne(
        {
          _id: cart_id,
        },
        {
          $push: { products: objectCart },
        }
      );
    }
    res.json({
      code: 200,
      message: "Đã thêm sản phẩm vào giỏ hàng",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thêm sản phẩm thất bại.",
    });
  }
};

// [GET] api/v1/cart/addCart
module.exports.delete = async (req, res) => {
  try {
    const cart_id = req.cookies.cartId;
    const productId = req.params.productId;
    await Cart.updateOne(
      {
        _id: cart_id,
      },
      {
        $pull: { products: { product_id: productId } },
      }
    );
    res.json({
      code: 200,
      message: "Xóa sản phẩm thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xóa sản phẩm thất bại.",
    });
  }
};

// [GET] api/v1/cart/update
module.exports.update = async (req, res) => {
  try {
    const cart_id = req.cookies.cartId;
    const productId = req.params.productId;
    const quantity = req.params.quantity;

    await Cart.updateOne(
      {
        _id: cart_id,
        "products.product_id": productId,
      },
      {
        $set: {
          "products.$.quantity": quantity,
        },
      }
    );
    res.json({
      code: 200,
      message: "Cập nhập số lượng thành công.",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Sửa thất bại",
    });
  }
};

module.exports.cartId = async (req, res) => {
  try {
    if (!req.cookies.cartId) {
      const cart = new Cart();
      await cart.save();
      const expiresCookie = 365 * 24 * 60 * 60 * 1000;
      res.cookie("cartId", cart._id, {
        expires: new Date(Date.now() + expiresCookie),
        httpOnly: true, // để trình duyệt chỉ gửi cookie qua HTTP(S) request
        secure: true, // yêu cầu HTTPS
        sameSite: "None", // cho phép chia sẻ giữa các tên miền
      });
      res.json("luu cookies");
    } else {
      // res.cookie("cartId", "", { expires: new Date(0) }); // Đặt expires là thời điểm trong quá khứ
      // res.json({ message: "Cart cookie has been cleared" });
      const cart = await Cart.findOne({
        _id: req.cookies.cartId,
      });
      if (!cart) {
        console.log("kh");
        res.json("NO");
        return;
      }
      console.log(cart);
      cart.totalQuantity = cart.products.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      res.json("oke");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
