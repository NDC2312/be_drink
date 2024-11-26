const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");

router.get("/", controller.index);

router.get("/detail/:id", controller.detail);

router.patch("/edit/:id", controller.edit);

router.patch("/delete/:id", controller.delete);

router.post("/google", controller.googleLogin);

router.post("/register", controller.register);

router.post("/login", controller.login);

router.get("/myAuth", controller.myAuth);

// Quen mat khau
router.post("/password/forgot", controller.forgotPassword);

router.post("/password/otp", controller.otpPassword);

router.post("/password/reset", controller.resetPassword);

module.exports = router;
