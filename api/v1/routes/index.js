const Products = require("./products");
const ProductCategory = require("./products-category.route");
const Blog = require("./blog.route");
const BlogCategory = require("./blogs-category.route");
const Account = require("./account.route");
const Role = require("./role.route");
const Auth = require("./auth.route");
const Checkout = require("./checkout.route");

//client
const ProductsClient = require("./products-client");
const Cart = require("./cart.route");

const requireAuth = require("../middlewares/auth.middleware");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(version + "/products", requireAuth.requireAuth, Products);
  app.use(version + "/products-client", ProductsClient);
  app.use(
    version + "/products-category",
    requireAuth.requireAuth,
    ProductCategory
  );
  app.use(version + "/cart", Cart);

  app.use(version + "/blogs", requireAuth.requireAuth, Blog);
  app.use(version + "/blogs-category", requireAuth.requireAuth, BlogCategory);

  app.use(version + "/account", Account);

  app.use(version + "/role", requireAuth.requireAuth, Role);

  app.use(version + "/auth", Auth);
  app.use(version + "/checkout", Checkout);
};
