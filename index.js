const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const database = require("./config/database");
const cookieParser = require("cookie-parser");

const routesApiVer1 = require("./api/v1/routes/index");

database.connect();
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://fe-drink.vercel.app"], // Thay bằng URL của FE
    credentials: true, // Cho phép gửi cookie cross-origin
  })
);
app.use(bodyParser.json());
const port = process.env.PORT;

// Router api/V1
routesApiVer1(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
