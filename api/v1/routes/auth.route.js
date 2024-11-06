const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");

router.post("/google", controller.googleLogin);

router.post("/register", controller.register);

router.post("/login", controller.login);

router.get("/myAuth", controller.myAuth);

module.exports = router;
