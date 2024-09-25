const express = require("express");
const router = express.Router();

const controller = require("../controllers/customer.controller");
const requireAuth = require("../middlewares/auth.middleware");

router.get("/", requireAuth.requireAuth, controller.index);

router.post("/create", controller.create);

router.patch(
  "/change-status/:id",
  requireAuth.requireAuth,
  controller.changeStatus
);

router.patch("/delete/:id", requireAuth.requireAuth, controller.delete);

module.exports = router;
