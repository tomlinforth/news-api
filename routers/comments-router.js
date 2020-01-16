const commentsRouter = require("express").Router();
const {
  updateCommentById,
  sendCommentById,
  removeCommentById
} = require("../controllers/c-comments");
const { invalidMethod } = require("../controllers/c-universal");

commentsRouter
  .route("/:commentID")
  .get(sendCommentById)
  .patch(updateCommentById)
  .delete(removeCommentById)
  .all(invalidMethod);

module.exports = commentsRouter;
