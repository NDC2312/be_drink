const express = require("express");
const router = express.Router();
const controller = require("../controllers/checkout.controller");

router.get("/", controller.index);

router.post("/order/:user_id", controller.order);

router.get("/order/success/:orderId", controller.success);

module.exports = router;
