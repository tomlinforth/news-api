const articlesRouter = require("express").Router();
const {
  sendArticles,
  sendArticleById,
  updateArticleById
} = require("../controllers/c-articles");
const {
  sendCommentsByArticleId,
  addCommentByArticleId
} = require("../controllers/c-comments");
const { invalidMethod } = require("../controllers/c-universal");

articlesRouter.get("/", sendArticles).all(invalidMethod);

articlesRouter
  .route("/:articleID")
  .get(sendArticleById)
  .patch(updateArticleById)
  .all(invalidMethod);

articlesRouter
  .route("/:articleID/comments")
  .get(sendCommentsByArticleId)
  .post(addCommentByArticleId)
  .all(invalidMethod);

module.exports = articlesRouter;
