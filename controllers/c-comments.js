const {
  selectCommentsByArticleId,
  insertCommentsByArticleId,
  patchCommentById,
  selectCommentById,
  deleteCommentById
} = require("../models/m-comments");

exports.sendCommentsByArticleId = (req, res, next) => {
  selectCommentsByArticleId(req.params, req.query)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.addCommentByArticleId = (req, res, next) => {
  insertCommentsByArticleId(req.params, req.body)
    .then(([newComment]) => {
      res.status(201).send({ comment: newComment });
    })
    .catch(next);
};

exports.updateCommentById = (req, res, next) => {
  patchCommentById(req.params, req.body)
    .then(([comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.sendCommentById = (req, res, next) => {
  selectCommentById(req.params)
    .then(([comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.removeCommentById = (req, res, next) => {
  deleteCommentById(req.params)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
