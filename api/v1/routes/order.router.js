const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");

router.get("/", controller.index);

// router.post("/create", controller.create);

router.patch("/change-status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.get("/detail/:id", controller.detail);

// router.patch("/edit/:id", controller.edit);

// router.patch("/delete/:id", controller.delete);

module.exports = router;
