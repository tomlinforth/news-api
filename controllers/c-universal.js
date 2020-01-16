exports.invalidMethod = (req, res, next) => {
  res.status(405).send({ msg: "Requested method on URL is unavailable." });
};
