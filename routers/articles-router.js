const articlesRouter = require("express").Router();
const {
  sendArticles,
  sendArticleById,
  updateArticleById,
  addNewArticle,
  removeArticleById
} = require("../controllers/c-articles");
const {
  sendCommentsByArticleId,
  addCommentByArticleId
} = require("../controllers/c-comments");
const { invalidMethod } = require("../controllers/c-universal");

articlesRouter
  .route("/")
  .get(sendArticles)
  .post(addNewArticle)
  .all(invalidMethod);

articlesRouter
  .route("/:articleID")
  .get(sendArticleById)
  .patch(updateArticleById)
  .delete(removeArticleById)
  .all(invalidMethod);

articlesRouter
  .route("/:articleID/comments")
  .get(sendCommentsByArticleId)
  .post(addCommentByArticleId)
  .all(invalidMethod);

module.exports = articlesRouter;
