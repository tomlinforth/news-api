const {
  selectArticles,
  selectAllArticles,
  selectArticleById,
  patchArticleById,
  insertNewArticle,
  deleteArticleById
} = require("../models/m-articles");

exports.sendArticles = (req, res, next) => {
  const total_articles = selectAllArticles(req.query);
  const actReq = selectArticles(req.query);
  Promise.all([total_articles, actReq])
    .then(([total_articles, actReq]) => {
      res
        .status(200)
        .send({ articles: actReq, total_count: total_articles.length });
    })
    .catch(next);
};

exports.sendArticleById = (req, res, next) => {
  selectArticleById(req.params)
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.updateArticleById = (req, res, next) => {
  patchArticleById(req.params, req.body)
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.addNewArticle = (req, res, next) => {
  insertNewArticle(req.body)
    .then(([article]) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.removeArticleById = (req, res, next) => {
  deleteArticleById(req.params)
    .then(rowCount => {
      res.sendStatus(204);
    })
    .catch(next);
};
