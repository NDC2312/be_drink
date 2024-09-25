const express = require("express");
const router = express.Router();

const controller = require("../controllers/role.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth.requirePermission("role-view"), controller.index);

router.post(
  "/create",
  auth.requirePermission("role-create"),
  controller.create
);

router.get("/detail/:id", controller.detail);

router.patch("/edit/:id", auth.requirePermission("role-edit"), controller.edit);

router.patch(
  "/delete/:id",
  auth.requirePermission("role-delete"),
  controller.delete
);

router.patch(
  "/permissions",
  auth.requirePermission("role-view"),
  controller.permissions
);

module.exports = router;
