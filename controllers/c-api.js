const path = require("path");

exports.sendAllEndpoints = (req, res, next) => {
  const filePath = path.resolve("endpoints.json");
  res.sendFile(filePath, err => {
    if (err) next(err);
  });
};
