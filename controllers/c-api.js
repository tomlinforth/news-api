exports.sendAllEndpoints = (req, res, next) => {
  const options = {
    root: "./"
  };
  res.sendFile("endpoints.json", options, err => {
    if (err) next(err);
  });
};
