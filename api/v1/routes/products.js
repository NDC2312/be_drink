const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const controller = require("../controllers/products");

router.get("/", auth.requirePermission("products-view"), controller.index);

router.post(
  "/create",
  auth.requirePermission("products-create"),
  controller.create
);

router.patch("/change-status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.get("/detail/:id", controller.detail);

router.patch(
  "/edit/:id",
  auth.requirePermission("products-edit"),
  controller.edit
);

router.patch(
  "/delete/:id",
  auth.requirePermission("products-delete"),
  controller.delete
);

module.exports = router;
