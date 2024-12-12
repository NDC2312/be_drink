const express = require("express");
const router = express.Router();
const controller = require("../controllers/review.controller");

router.get("/", controller.index);

router.post("/create", controller.create);

router.patch("/delete/:reviewId", controller.delete);

module.exports = router;
