const Cart = require("../models/cart.model");
const Product = require("../models/products.model");
const Order = require("../models/order.model");
const productsHelper = require("../../../Helper/product.helper");

// [GET] api/v1/checkout
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
        item.totalPriceProduct = products.priceNew * item.quantity;
      }
    }
    cart.totalPrice = cart.products.reduce(
      (sum, item) => sum + item.totalPriceProduct,
      0
    );

    const updatedCartProducts = cart.products.map((item) => {
      return {
        ...item.toJSON(),
        productInfo: item.productInfo,
        totalPrice: cart.totalPrice,
        priceNew: item.productInfo.priceNew,
        totalPriceProduct: item.totalPriceProduct,
      };
    });

    res.json({
      _id: cart._id,
      products: updatedCartProducts,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi thanh toán",
    });
  }
};

// [POST] /checkout/order
module.exports.order = async (req, res) => {
  const cartId = req.cookies.cartId;
  const user_id = req.params.user_id;
  const userInfo = req.body;
  console.log(userInfo);
  const cart = await Cart.findOne({
    _id: cartId,
  });

  const products = [];
  for (const product of cart.products) {
    const objectProduct = {
      product_id: product.product_id,
      price: Number,
      discountPercentage: Number,
      quantity: product.quantity,
    };

    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("price discountPercentage");
    objectProduct.price = productInfo.price;
    objectProduct.discountPercentage = productInfo.discountPercentage;
    products.push(objectProduct);
  }

  const orderInfo = {
    cart_id: cartId,
    user_id: user_id,
    userInfo: userInfo,
    products: products,
  };
  const order = new Order(orderInfo);
  order.save();

  await Cart.updateOne(
    {
      _id: cartId,
    },
    {
      products: [],
    }
  );

  res.json(order);
};

// [GET] /checkout/order/success
module.exports.success = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
  });

  for (const product of order.products) {
    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("title thumbnail");
    product.productInfo = productInfo;
    product.priceNew = productsHelper.priceNewProduct(product);
    product.totalPriceProduct = product.priceNew * product.quantity;
  }

  order.totalPrice = order.products.reduce(
    (sum, item) => sum + item.totalPriceProduct,
    0
  );

  const orderNew = order.products.map((item) => {
    return {
      ...item.toJSON(),
      totalPrice: order.totalPrice,
      priceNew: item.priceNew,
      totalPriceProduct: item.totalPriceProduct,
    };
  });

  res.json(orderNew);
};
