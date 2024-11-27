const express = require("express");
const router = express.Router();

const controller = require("../controllers/blog-client.controller");

router.get("/blogs-category", controller.blogCategory);

router.get("/blogs/:slugCategory", controller.category);

router.get("/detail/:slugProduct", controller.detail);

module.exports = router;
