const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");

router.get("/", controller.index);

router.post("/add/:productId", controller.addCart);

router.get("/delete/:productId", controller.delete);

router.get("/update/:productId/:quantity", controller.update);

router.get("/cartId", controller.cartId);

module.exports = router;
