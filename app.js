const express = require("express");
const apiRouter = require("./routers/api-router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use(function errHandler(err, req, res, next) {
  console.log(err);
});

module.exports = app;
