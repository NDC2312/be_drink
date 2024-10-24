const Cart = require("../models/cart.model");

module.exports.cartId = async (req, res, next) => {
  try {
    if (!req.cookies.cartId) {
      const cart = new Cart();
      await cart.save();
      const expiresCookie = 365 * 24 * 60 * 60 * 1000;
      res.cookie("cartId", cart._id, {
        expires: new Date(Date.now() + expiresCookie),
      });
    } else {
      const cart = await Cart.findOne({
        _id: req.cookies.cartId,
      });
      cart.totalQuantity = cart.products.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      //   res.json(cart);
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
