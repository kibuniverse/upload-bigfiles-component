var express = require("express");
var app = express();
app.use("*", function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  next(); // 链式操作
});

app.use(express.static("./build"));

app.listen(7979, () => {
  console.log("项目在7979端口");
});
