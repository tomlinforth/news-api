const { selectUserByUsername, selectUsers } = require("../models/m-users");

exports.sendUserByUsername = (req, res, next) => {
  selectUserByUsername(req.params)
    .then(([user]) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.sendUsers = (req, res, next) => {
  selectUsers().then(users => {
    res
      .status(200)
      .send({ users })
      .catch(next);
  });
};
