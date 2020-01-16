const { selectUserByUsername } = require("../models/m-users");

exports.sendUserByUsername = (req, res, next) => {
  selectUserByUsername(req.params)
    .then(([user]) => {
      res.status(200).send({ user });
    })
    .catch(next);
};
