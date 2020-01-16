const connection = require("../db/connection");

exports.selectUserByUsername = ({ username }, isQuery) => {
  return connection("users")
    .select("*")
    .where("username", username)
    .then(user => {
      if (user.length !== 0 && !isQuery) {
        return user;
      } else if (user.length !== 0 && isQuery) {
        return [];
      } else {
        if (isQuery) {
          return Promise.reject({
            msg: "User does not exist.",
            status: 400
          });
        } else {
          return Promise.reject({ msg: "User does not exist.", status: 404 });
        }
      }
    });
};

exports.checkUserByUsername = ({ username }) => {
  return connection("users")
    .select("*")
    .where("username", username)
    .then(user => {
      if (user.length !== 0) return user;
      else return Promise.reject({ msg: "User does not exist.", status: 400 });
    });
};
