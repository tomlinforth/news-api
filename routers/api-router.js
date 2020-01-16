const apiRouter = require("express").Router();
const articlesRouter = require("../routers/articles-router");
const commentsRouter = require("../routers/comments-router");
const { sendTopics } = require("../controllers/c-topics");
const { sendUserByUsername } = require("../controllers/c-users");
const { invalidMethod } = require("../controllers/c-universal");

apiRouter
  .route("/")
  .get()
  .delete(invalidMethod);

apiRouter
  .route("/topics")
  .get(sendTopics)
  .all(invalidMethod);
apiRouter
  .route("/users/:username")
  .get(sendUserByUsername)
  .all(invalidMethod);

apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
