const express = require("express");
const apiRouter = require("./routers/api-router");
const { psqlErr, customErr } = require("./errors/index");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);
app.get("/*", function notARoute(req, res, next) {
  res.status(404).send({ msg: "Requested URL doesnt exist." });
});

app.use(psqlErr);

app.use(customErr);

module.exports = app;
