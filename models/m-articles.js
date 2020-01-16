const connection = require("../db/connection");
const { rejectIfInvalidSortOrOrder } = require("../db/utils/utils");
const { selectTopicBySlug } = require("../models/m-topics");
const { selectUserByUsername } = require("../models/m-users");
const types = require("pg").types;
types.setTypeParser(20, val => parseInt(val));

exports.selectArticles = query => {
  const validSortByKeys = [
    "article_id",
    "title",
    "votes",
    "topic",
    "author",
    "created_at"
  ];
  const queryKeyRef = { sort_by: true, order: true, topic: true, author: true };
  const orderSortCheck = rejectIfInvalidSortOrOrder(validSortByKeys, query);
  if (orderSortCheck) return orderSortCheck;

  for (let key in query) {
    if (!queryKeyRef[key]) {
      return Promise.reject({ status: 400, msg: "Invalid query parameter." });
    }
  }
  return connection("articles")
    .leftJoin("comments", "articles.article_id", "=", "comments.article_id")
    .count("comment_id as comment_count")
    .select(
      "articles.article_id",
      "title",
      "articles.votes",
      "topic",
      "articles.author",
      "articles.created_at"
    )
    .groupBy("articles.article_id")
    .orderBy(query.sort_by || "created_at", query.order || "desc")
    .modify(currentQuery => {
      if (query.topic) {
        currentQuery.where("topic", query.topic);
      }
      if (query.author) {
        currentQuery.where("articles.author", query.author);
      }
    })
    .then(articles => {
      if (articles.length !== 0) {
        return articles;
      } else {
        if (query.topic) {
          return selectTopicBySlug({ slug: query.topic }, true);
        }
        if (query.author) {
          return selectUserByUsername({ username: query.author }, true);
        }
      }
    })
    .then(ambigRes => {
      if (!ambigRes[0]) {
        return [];
      } else {
        return ambigRes;
      }
    });
};

exports.selectArticleById = ({ articleID }) => {
  return connection("articles")
    .leftJoin("comments", "articles.article_id", "=", "comments.article_id")
    .count("comment_id as comment_count")
    .select(
      "articles.article_id",
      "title",
      "articles.body",
      "articles.votes",
      "topic",
      "articles.author",
      "articles.created_at"
    )
    .where("articles.article_id", articleID)
    .groupBy("articles.article_id")
    .then(article => {
      if (article.length !== 0) return article;
      else return Promise.reject({ msg: "Article doesnt exist.", status: 404 });
    });
};

exports.patchArticleById = ({ articleID }, { inc_votes }) => {
  if (inc_votes) {
    return connection("articles")
      .where("article_id", articleID)
      .increment("votes", inc_votes)
      .returning("*")
      .then(article => {
        if (article.length !== 0) return article;
        else
          return Promise.reject({ status: 404, msg: "Article doesnt exist." });
      });
  } else {
    return Promise.reject({
      status: 400,
      msg: "Invalid data (missing inc_votes)."
    });
  }
};
