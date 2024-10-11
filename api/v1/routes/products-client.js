const express = require("express");
const router = express.Router();

const controller = require("../controllers/products-client.controller");

router.get("/", controller.index);

router.get("/featured", controller.featured);

router.get("/category/:slugCategory", controller.category);

router.get("/detail/:slugProduct", controller.detail);

module.exports = router;
