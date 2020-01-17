exports.sendAllEndpoints = (req, res, next) => {
  const options = {
    root: "./"
  };
  console.log(options);
  res.sendFile("endpoints.json", options, err => {
    if (err) next(err);
  });
};
