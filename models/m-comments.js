const connection = require("../db/connection");
const { rejectIfInvalidSortOrOrder } = require("../db/utils/utils");
const { selectArticleById } = require("./m-articles");

exports.selectCommentsByArticleId = ({ articleID }, query) => {
  const commentKeys = ["comment_id", "votes", "body", "created_at", "author"];
  const orderSortCheck = rejectIfInvalidSortOrOrder(commentKeys, query);
  if (orderSortCheck) return orderSortCheck;

  const articleCheck = selectArticleById({ articleID });
  const commentData = connection("comments")
    .select(...commentKeys)
    .where("article_id", articleID)
    .orderBy(query.sort_by || "created_at", query.order || "desc");
  return Promise.all([articleCheck, commentData]).then(
    ([articleCheck, commentData]) => {
      if (commentData.length !== 0) return commentData;
      else return [];
    }
  );
};

exports.insertCommentsByArticleId = ({ articleID }, { username, body }) => {
  return connection("comments")
    .insert({
      author: username,
      body,
      article_id: articleID
    })
    .returning("*");
};

exports.patchCommentById = ({ commentID }, { inc_votes }) => {
  if (inc_votes) {
    return connection("comments")
      .where("comment_id", commentID)
      .increment("votes", inc_votes)
      .returning("*")
      .then(comment => {
        if (comment.length !== 0) return comment;
        else
          return Promise.reject({
            status: 404,
            msg: "Comment does not exist."
          });
      });
  } else {
    return Promise.reject({
      status: 400,
      msg: "Invalid data (missing inc_votes)"
    });
  }
};

exports.selectCommentById = ({ commentID }) => {
  return connection("comments")
    .where("comment_id", commentID)
    .select("*")
    .then(comment => {
      if (comment.length !== 0) return comment;
      else
        return Promise.reject({ status: 404, msg: "Comment does not exist." });
    });
};

exports.deleteCommentById = ({ commentID }) => {
  return connection("comments")
    .where("comment_id", commentID)
    .del()
    .then(rowCount => {
      if (rowCount !== 0) return rowCount;
      else return this.selectCommentById({ commentID });
    });
};
