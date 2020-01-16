const express = require("express");
const apiRouter = require("./routers/api-router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);
app.get("/*", function notARoute(req, res, next) {
  res.status(404).send({ msg: "Requested URL doesnt exist." });
});

app.use(function psqlErr(err, req, res, next) {
  if (err.code) {
    const errRef = {
      "22P02": { status: 400, msg: "Invalid data type (integer needed)." },
      "22003": { status: 400, msg: "Invalid ID (number too long)." },
      "23503": { status: 404, msg: "Specified ID does not exist." },
      "23502": { status: 400, msg: "Missing data in request." }
    };
    res.status(errRef[err.code].status).send({ msg: errRef[err.code].msg });
  } else {
    next(err);
  }
});

app.use(function customErr(err, req, res, next) {
  res.status(err.status).send({ msg: err.msg });
});

module.exports = app;
