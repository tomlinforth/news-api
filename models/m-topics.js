const connection = require("../db/connection");

exports.selectTopics = () => {
  return connection("topics").select("*");
};

exports.selectTopicBySlug = ({ slug }, isQuery) => {
  return connection("topics")
    .select("*")
    .where("slug", slug)
    .then(topic => {
      if (topic.length !== 0) {
        return topic;
      } else {
        if (isQuery) {
          return Promise.reject({
            status: 400,
            msg: "Topic doesnt exist."
          });
        } else {
          return Promise.reject({ status: 404, msg: "Topic doesnt exist." });
        }
      }
    });
};
