const Cart = require("../models/cart.model");
const Product = require("../models/products.model");
const Order = require("../models/order.model");
const productsHelper = require("../../../Helper/product.helper");
const sendMailHelper = require("../../../Helper/sendMail");

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
  const email = req.body.email;
  const fullName = req.body.fullName;
  const phone = req.body.phone;
  const address = req.body.address;
  const note = req.body.note;
  const cart = await Cart.findOne({
    _id: cartId,
  });
  const products = [];
  let productListHtml = "";
  let objectProduct = {
    product_id: String,
    price: Number,
    discountPercentage: Number,
    quantity: Number,
    totalPrice: Number,
  };
  for (const product of cart.products) {
    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("price discountPercentage thumbnail title");
    objectProduct.product_id = product._id;
    objectProduct.price = productsHelper.priceNewProduct(productInfo);
    objectProduct.discountPercentage = productInfo.discountPercentage;
    objectProduct.quantity = product.quantity;
    product.totalPriceProduct = objectProduct.price * objectProduct.quantity;
    products.push(objectProduct);
    productListHtml += `
    <div style="display: flex; align-items: center; margin: 20px 0;">
      <img src="${productInfo.thumbnail}" alt="${
      productInfo.title
    }" style="width: 80px; height: 80px; margin-right: 15px; border-radius: 8px;">
      <div>
        <p style="margin: 0;"><strong>${productInfo.title}</strong></p>
        <p style="margin: 0;">Số lượng: ${product.quantity}</p>
        <p style="margin: 0;">Giá: ${productsHelper.priceNewProduct(
          productInfo
        )} VND</p>
        <p style="margin: 0;">Giảm giá: ${productInfo.discountPercentage}%</p>
      </div>
    </div>
  `;
  }
  objectProduct.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPriceProduct,
    0
  );

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
  // Neu ton tai email thi gui mai qua OTP qua email
  // Generate product list HTML
  const subject = `Xác nhận đơn hàng ${order._id} từ NTK`;
  const html = `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
    <p>Xin chào ${fullName},</p>
    <p>Cảm ơn Anh/Chị đã đặt hàng tại <strong>NTK!</strong></p>
    <p>Đơn hàng của Anh/Chị đã được tiếp nhận, chúng tôi sẽ nhanh chóng liên hệ với Anh/Chị.</p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
    
    <table style="width: 100%; margin-bottom: 20px;">
        <tr>
            <td style="vertical-align: top;">
                <h3>Thông tin mua hàng</h3>
                <p>${fullName}</p>
                <p><a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
                <p>${phone}</p>
            </td>
            <td style="vertical-align: top;">
                <h3>Địa chỉ nhận hàng</h3>
                <p>${address}</p>
            </td>
        </tr>
    </table>   
    <table style="width: 100%; margin-bottom: 20px;">
        <tr>
            <td>
                <strong>Phương thức thanh toán</strong>
                <p>Thanh toán khi giao hàng (COD)</p>
            </td>
            <td>
                <strong>Phương thức vận chuyển</strong>
                <p>Giao hàng tận nơi</p>
            </td>
        </tr>
    </table>
    
    <h3>Thông tin đơn hàng</h3>
    <p>Mã đơn hàng: ${order._id}</p>
    <p>Ngày đặt hàng: ${new Date().toLocaleDateString()}</p>

    ${productListHtml}
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
    
    <table style="width: 100%; margin-bottom: 20px; text-align: right;">
        <tr>
            <td>Phí vận chuyển:</td>
            <td>40.000 VND</td>
        </tr>
        <tr>
            <td><strong>Thành tiền:</strong></td>
            <td><strong></strong></td>
        </tr>
    </table>
</div>
`;

  sendMailHelper.sendMail(email, subject, html);
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
      productInfo: item.productInfo,
      priceNew: item.priceNew,
      totalPriceProduct: item.totalPriceProduct,
    };
  });

  res.json(orderNew);
};
