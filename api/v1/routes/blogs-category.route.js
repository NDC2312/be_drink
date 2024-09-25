const express = require("express");
const router = express.Router();

const controller = require("../controllers/blog-category.controller");
const auth = require("../middlewares/auth.middleware");

router.get(
  "/",
  auth.requirePermission("blogs-category-view"),
  controller.index
);

router.post(
  "/create",
  auth.requirePermission("blogs-category-create"),
  controller.create
);

router.patch(
  "/edit/:id",
  auth.requirePermission("blogs-category-edit"),
  controller.edit
);

router.get("/detail/:id", controller.detail);

router.patch(
  "/delete/:id",
  auth.requirePermission("blogs-category-delete"),
  controller.delete
);

router.patch("/change-status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

module.exports = router;
