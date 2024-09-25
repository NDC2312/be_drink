const express = require("express");
const router = express.Router();

const controller = require("../controllers/blog.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth.requirePermission("blogs-view"), controller.index);

router.post(
  "/create",
  auth.requirePermission("blogs-create"),
  controller.create
);

router.patch("/change-status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.get("/detail/:id", controller.detail);

router.patch(
  "/edit/:id",
  auth.requirePermission("blogs-edit"),
  controller.edit
);

router.patch(
  "/delete/:id",
  auth.requirePermission("blogs-delete"),
  controller.delete
);

module.exports = router;
