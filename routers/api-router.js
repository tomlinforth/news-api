const apiRouter = require("express").Router();
const articlesRouter = require("../routers/articles-router");
const commentsRouter = require("../routers/comments-router");
const { sendTopics } = require("../controllers/c-topics");
const { sendUserByUsername, sendUsers } = require("../controllers/c-users");
const { invalidMethod } = require("../controllers/c-universal");
const { sendAllEndpoints } = require("../controllers/c-api");

apiRouter
  .route("/")
  .get(sendAllEndpoints)
  .delete(invalidMethod);

apiRouter
  .route("/topics")
  .get(sendTopics)
  .all(invalidMethod);

apiRouter
  .route("/users")
  .get(sendUsers)
  .all(invalidMethod);

apiRouter
  .route("/users/:username")
  .get(sendUserByUsername)
  .all(invalidMethod);

apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
