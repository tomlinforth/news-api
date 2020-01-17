process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const connection = require("../db/connection");
const chai = require("chai");
const { expect } = chai;
chai.should();
chai.use(require("chai-sorted"));
chai.use(require("chai-things"));
const endpointData = require("../endpoints.json");

describe("/api", () => {
  beforeEach(() => {
    return connection.seed.run();
  });
  after(() => {
    connection.destroy();
  });

  describe("'Happy' tests", () => {
    describe("GET", () => {
      it("GET:200, sends endpoints json file", () => {
        return request(app)
          .get("/api")
          .expect(200)
          .then(response => {
            expect(response.body).to.eql(endpointData);
          });
      });
    });
    describe("/topics", () => {
      describe("GET", () => {
        it("GET:200 returns array of topics", () => {
          return request(app)
            .get("/api/topics")
            .expect(200)
            .then(response => {
              expect(response.body.topics).to.be.an("array");
              expect(response.body.topics).to.all.have.keys(
                "slug",
                "description"
              );
            });
        });
      });
    });
    describe("/users", () => {
      describe("GET", () => {
        it("GET:200 on /:username returns data on that user", () => {
          return request(app)
            .get("/api/users/rogersop")
            .expect(200)
            .then(response => {
              expect(response.body.user).to.be.an("object");
              expect(response.body.user).to.eql({
                username: "rogersop",
                name: "paul",
                avatar_url:
                  "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4"
              });
            });
        });
      });
    });
    describe("/articles", () => {
      describe("GET", () => {
        it("GET:200 returns array of articles, with a comment count on each article and an overall article count", () => {
          return request(app)
            .get("/api/articles")
            .expect(200)
            .then(response => {
              expect(response.body.articles).to.be.an("array");
              expect(response.body.articles).to.all.have.keys(
                "author",
                "title",
                "article_id",
                "topic",
                "created_at",
                "votes",
                "comment_count"
              );
              expect(
                response.body.articles
              ).to.include.something.that.deep.equals({
                article_id: 1,
                title: "Living in the shadow of a great man",
                votes: 100,
                topic: "mitch",
                author: "butter_bridge",
                created_at: "2018-11-15T12:21:54.171Z",
                comment_count: 13
              });
              expect(response.body.total_count).to.equal(10);
            });
        });
        it("GET:200 on / when passed no query defaults to sort by created_at, order desc", () => {
          return request(app)
            .get("/api/articles")
            .expect(200)
            .then(response => {
              expect(response.body.articles).to.be.sortedBy("created_at", {
                descending: true
              });
            });
        });
        it("GET:200 on / when passed a sort_by query returns articles sorted by query, default order(desc)", () => {
          return request(app)
            .get("/api/articles?sort_by=title")
            .expect(200)
            .then(response => {
              expect(response.body.articles).to.be.sortedBy("title", {
                descending: true
              });
            });
        });
        it("GET:200 on / when passed an order query returns articles sorted by default(created_at), ordered by query", () => {
          return request(app)
            .get("/api/articles?order=asc")
            .expect(200)
            .then(response => {
              expect(response.body.articles).to.be.sortedBy("created_at", {
                descending: false
              });
            });
        });
        it("GET:200 on / when passed an order and sort_by query returns sorted articles", () => {
          return request(app)
            .get("/api/articles?sort_by=author&order=asc")
            .expect(200)
            .then(response => {
              expect(response.body.articles).to.be.sortedBy("author", {
                descending: false
              });
            });
        });
        it("GET:200 on / when passed a topic filter query, returning any articles matching the topic", () => {
          return request(app)
            .get("/api/articles?topic=mitch")
            .expect(200)
            .then(response => {
              const filterCheck = response.body.articles.every(
                article => article.topic === "mitch"
              );
              expect(filterCheck).to.be.true;
            });
        });
        it("GET:200 on / when passed a author filter query, returning any articles made by the author", () => {
          return request(app)
            .get("/api/articles?author=icellusedkars")
            .expect(200)
            .then(response => {
              const filterCheck = response.body.articles.every(
                article => article.author === "icellusedkars"
              );
              expect(filterCheck).to.be.true;
            });
        });
        it("GET:200 on / when passed an author or topic that exist but have no articles related to them", () => {
          const noArticleTopic = request(app)
            .get("/api/articles?topic=paper")
            .expect(200);
          const noArticleAuthor = request(app)
            .get("/api/articles?author=lurker")
            .expect(200);
          return Promise.all([noArticleTopic, noArticleAuthor]).then(
            ([noArticleTopic, noArticleAuthor]) => {
              expect(noArticleTopic.body.articles).to.eql([]);
              expect(noArticleAuthor.body.articles).to.eql([]);
            }
          );
        });
        it("GET:200 on / when passed existing author and topic that have no articles related to them", () => {
          return request(app)
            .get("/api/articles?topic=paper&author=rogersop")
            .expect(200)
            .then(response => {
              expect(response.body.articles).to.eql([]);
            });
        });
        it("GET:200 on / when passed a limit query, returning specified amount of articles, defaulting to 10", () => {
          const defaultCheck = request(app)
            .get("/api/articles")
            .expect(200);
          const limitCheck = request(app)
            .get("/api/articles?limit=5")
            .expect(200);
          return Promise.all([defaultCheck, limitCheck]).then(
            ([defaultCheck, limitCheck]) => {
              expect(defaultCheck.body.articles).to.have.length(10);
              expect(defaultCheck.body.total_count).to.equal(10);
              expect(limitCheck.body.articles).to.have.length(5);
              expect(limitCheck.body.total_count).to.equal(5);
            }
          );
        });
        it("GET:200 on / when passed not an integer into the limit query, sets to default", () => {
          return request(app)
            .get("/api/articles?limit=a")
            .expect(200)
            .then(response => {
              expect(response.body.total_count).to.equal(10);
            });
        });
        it("GET:200 on / when passed a page query, returning correct page based on limit", () => {
          const defaultLimitPage = request(app)
            .get("/api/articles?p=2")
            .expect(200);
          const customLimitPage = request(app)
            .get("/api/articles?limit=4&p=3")
            .expect(200);
          return Promise.all([defaultLimitPage, customLimitPage]).then(
            ([defLimRes, cusLimRes]) => {
              expect(defLimRes.body.total_count).to.equal(2);
              expect(defLimRes.body.articles[0]).to.contain({ article_id: 11 });
              expect(cusLimRes.body.total_count).to.equal(4);
              expect(cusLimRes.body.articles[0]).to.contain({ article_id: 9 });
            }
          );
        });
        it("GET:200 on / when passed not an integer into the page query, sets to default", () => {
          return request(app)
            .get("/api/articles?p=a")
            .expect(200)
            .then(response => {
              expect(response.body.total_count).to.equal(10);
              expect(response.body.articles[0]).to.contain({ article_id: 1 });
            });
        });
      });
      describe("POST", () => {
        it("POST:201 on / adds new article, returns new article object", () => {
          return request(app)
            .post("/api/articles")
            .send({
              title: "Test article",
              topic: "cats",
              body: "This is a test article.",
              username: "rogersop"
            })
            .expect(201)
            .then(response => {
              expect(response.body.article).to.have.keys(
                "article_id",
                "title",
                "author",
                "topic",
                "body",
                "votes",
                "created_at"
              );
              expect(response.body.article).to.contain({
                title: "Test article",
                topic: "cats",
                body: "This is a test article.",
                author: "rogersop"
              });
            });
        });
        it("POST:201 on / ignores extra data in the body", () => {
          return request(app)
            .post("/api/articles")
            .send({
              title: "Test article",
              topic: "cats",
              body: "This is a test article.",
              username: "rogersop",
              article_id: 1
            })
            .expect(201)
            .then(response => {
              expect(response.body.article).to.contain({
                title: "Test article",
                topic: "cats",
                body: "This is a test article.",
                author: "rogersop"
              });
              expect(response.body.article).to.not.contain({ article_id: 1 });
            });
        });
      });
      describe("/:article_id", () => {
        describe("GET", () => {
          it("GET:200 on / returns object containing all data of that article", () => {
            return request(app)
              .get("/api/articles/1")
              .expect(200)
              .then(response => {
                expect(response.body.article).to.be.an("object");
                expect(response.body.article).to.eql({
                  author: "butter_bridge",
                  title: "Living in the shadow of a great man",
                  article_id: 1,
                  body: "I find this existence challenging",
                  topic: "mitch",
                  created_at: "2018-11-15T12:21:54.171Z",
                  votes: 100,
                  comment_count: 13
                });
              });
          });
        });
        describe("PATCH", () => {
          it("PATCH:200 on / increases votes based on user input, returns updated article", () => {
            return request(app)
              .patch("/api/articles/1")
              .send({ inc_votes: 1 })
              .expect(200)
              .then(response => {
                expect(response.body.article).to.eql({
                  author: "butter_bridge",
                  title: "Living in the shadow of a great man",
                  article_id: 1,
                  body: "I find this existence challenging",
                  topic: "mitch",
                  created_at: "2018-11-15T12:21:54.171Z",
                  votes: 101
                });
                return request(app).get("/api/articles/1");
              })
              .then(response => {
                expect(response.body.article.votes).to.equal(101);
              });
          });
          it("PATCH:200 on / decreases votes based on user input, returns updated article", () => {
            return request(app)
              .patch("/api/articles/1")
              .send({ inc_votes: -1 })
              .expect(200)
              .then(response => {
                expect(response.body.article).to.eql({
                  author: "butter_bridge",
                  title: "Living in the shadow of a great man",
                  article_id: 1,
                  body: "I find this existence challenging",
                  topic: "mitch",
                  created_at: "2018-11-15T12:21:54.171Z",
                  votes: 99
                });
                return request(app).get("/api/articles/1");
              })
              .then(response => {
                expect(response.body.article.votes).to.equal(99);
              });
          });
          it("PATCH:200 on / when the passed body contains extra data, ignores anything other than inc_votes", () => {
            return request(app)
              .patch("/api/articles/1")
              .send({ inc_votes: 1, topic: "hi" })
              .expect(200)
              .then(response => {
                expect(response.body.article).to.eql({
                  author: "butter_bridge",
                  title: "Living in the shadow of a great man",
                  article_id: 1,
                  body: "I find this existence challenging",
                  topic: "mitch",
                  created_at: "2018-11-15T12:21:54.171Z",
                  votes: 101
                });
                return request(app).get("/api/articles/1");
              })
              .then(response => {
                expect(response.body.article.votes).to.equal(101);
              });
          });
        });
        describe("DELETE", () => {
          it("DELETE:204 on / deletes article from database, returns nothing", () => {
            return request(app)
              .delete("/api/articles/1")
              .expect(204)
              .then(() => {
                return request(app)
                  .get("/api/articles/1")
                  .expect(404)
                  .then(response => {
                    expect(response.body.msg).to.equal("Article doesnt exist.");
                  });
              });
          });
        });
        describe("/comments", () => {
          describe("GET", () => {
            it("GET:200 on / returns array of all comments relating to given id", () => {
              return request(app)
                .get("/api/articles/9/comments")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.be.an("array");
                  expect(response.body.comments).to.all.have.keys(
                    "comment_id",
                    "votes",
                    "created_at",
                    "author",
                    "body"
                  );
                  expect(
                    response.body.comments
                  ).to.include.something.that.deep.equals({
                    comment_id: 17,
                    body: "The owls are not what they seem.",
                    author: "icellusedkars",
                    votes: 20,
                    created_at: "2001-11-26T12:36:03.389Z"
                  });
                });
            });
            it("GET:200 on / defaults to sort by created_at descending when passed no query", () => {
              return request(app)
                .get("/api/articles/1/comments")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.be.sortedBy("created_at", {
                    descending: true
                  });
                });
            });
            it("GET:200 on / when passed a sort_by query returns sorted comments by query, default order(desc)", () => {
              return request(app)
                .get("/api/articles/1/comments?sort_by=votes")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.be.sortedBy("votes", {
                    descending: true
                  });
                });
            });
            it("GET:200 on / when passed an order query returns comments sorted by default(created_at), ordered by query", () => {
              return request(app)
                .get("/api/articles/1/comments?order=asc")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.be.sortedBy("created_at", {
                    descending: false
                  });
                });
            });
            it("GET:200 on / when passed an order and sort_by query returns sorted comments", () => {
              return request(app)
                .get("/api/articles/1/comments?sort_by=votes&order=asc")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.be.sortedBy("votes", {
                    descending: false
                  });
                });
            });
            it("GET:200 on / when passed an id with no associated comments return empty array", () => {
              return request(app)
                .get("/api/articles/8/comments")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.eql([]);
                });
            });
            it("GET:200 on / when passed a limit query, returning specified amount of articles, defaulting to 10", () => {
              const defaultCheck = request(app)
                .get("/api/articles/1/comments")
                .expect(200);
              const limitCheck = request(app)
                .get("/api/articles/1/comments?limit=5")
                .expect(200);
              return Promise.all([defaultCheck, limitCheck]).then(
                ([defaultCheck, limitCheck]) => {
                  expect(defaultCheck.body.comments).to.have.length(10);
                  expect(limitCheck.body.comments).to.have.length(5);
                }
              );
            });
            it("GET:200 on / when passed not an integer into the limit query, sets to default", () => {
              return request(app)
                .get("/api/articles/1/comments?limit=a")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.have.length(10);
                });
            });
            it("GET:200 on / when passed a page query, returning correct page based on limit", () => {
              const defaultLimitPage = request(app)
                .get("/api/articles/1/comments?p=2")
                .expect(200);
              const customLimitPage = request(app)
                .get("/api/articles/1/comments?limit=4&p=3")
                .expect(200);
              return Promise.all([defaultLimitPage, customLimitPage]).then(
                ([defLimRes, cusLimRes]) => {
                  expect(defLimRes.body.comments).to.have.length(3);
                  expect(cusLimRes.body.comments).to.have.length(4);
                }
              );
            });
            it("GET:200 on / when passed not an integer into the page query, sets to default", () => {
              return request(app)
                .get("/api/articles/1/comments?p=a")
                .expect(200)
                .then(response => {
                  expect(response.body.comments).to.have.length(10);
                });
            });
          });
          describe("POST", () => {
            it("POST:201 on / adds new comment, returns new comment data", () => {
              return request(app)
                .post("/api/articles/1/comments")
                .send({ username: "rogersop", body: "This is a test comment" })
                .expect(201)
                .then(response => {
                  expect(response.body.comment).to.have.keys(
                    "comment_id",
                    "body",
                    "article_id",
                    "votes",
                    "created_at",
                    "author"
                  );
                  expect(response.body.comment).to.contain({
                    body: "This is a test comment",
                    author: "rogersop",
                    votes: 0,
                    article_id: 1,
                    comment_id: 19
                  });
                });
            });
            it("POST:201 on / ignores extra data in the body", () => {
              return request(app)
                .post("/api/articles/1/comments")
                .send({
                  username: "rogersop",
                  body: "This is a test comment",
                  testIgnore: "This should be ignored"
                })
                .expect(201)
                .then(response => {
                  expect(response.body.comment).to.not.contain({
                    testIgnore: "This should be ignored"
                  });
                });
            });
          });
        });
      });
    });
    describe("/comments", () => {
      describe("/:comment_id", () => {
        describe("PATCH", () => {
          it("PATCH:200 on / increases votes based on user input, returns updated comment", () => {
            return request(app)
              .patch("/api/comments/1")
              .send({ inc_votes: 1 })
              .expect(200)
              .then(response => {
                expect(response.body.comment).to.contain({ votes: 17 });
                return request(app).get("/api/comments/1");
              })
              .then(response => {
                expect(response.body.comment).to.contain({ votes: 17 });
              });
          });
          it("PATCH:200 on / decreases votes based on user input, returns updated comment", () => {
            return request(app)
              .patch("/api/comments/1")
              .send({ inc_votes: -1 })
              .expect(200)
              .then(response => {
                expect(response.body.comment).to.contain({ votes: 15 });
                return request(app).get("/api/comments/1");
              })
              .then(response => {
                expect(response.body.comment).to.contain({ votes: 15 });
              });
          });
          it("PATCH:200 on / ignores extra data passed through on the body", () => {
            return request(app)
              .patch("/api/comments/1")
              .send({ inc_votes: 10, body: "Shouldnt be this." })
              .expect(200)
              .then(response => {
                expect(response.body.comment).to.contain({
                  votes: 26,
                  body:
                    "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
                });
                return request(app).get("/api/comments/1");
              })
              .then(response => {
                expect(response.body.comment).to.contain({
                  votes: 26,
                  body:
                    "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
                });
              });
          });
        });
        describe("DELETE", () => {
          it("DELETE:204 on / deletes the comment, returns nothing", () => {
            return request(app)
              .delete("/api/comments/1")
              .expect(204)
              .then(() => {
                return request(app).get("/api/comments/1");
              })
              .then(response => {
                expect(response.body.msg).to.equal("Comment does not exist.");
              });
          });
        });
      });
    });
  });

  describe("ERROR tests", () => {
    describe("/users - ERR", () => {
      describe("GET", () => {
        it("GET:404 on /:username when username doesnt exist", () => {
          return request(app)
            .get("/api/users/nonexistant")
            .expect(404)
            .then(response => {
              expect(response.body.msg).to.equal("User does not exist.");
            });
        });
      });
      describe("UNAVAILABLE METHODS", () => {
        it("*:405 on /:username returns invalid method message", () => {
          const invalidPost = request(app)
            .post("/api/users/rogersop")
            .expect(405);

          const invalidPatch = request(app)
            .patch("/api/users/rogersop")
            .expect(405);

          const invalidPut = request(app)
            .put("/api/users/rogersop")
            .expect(405);

          const invalidDelete = request(app)
            .delete("/api/users/rogersop")
            .expect(405);

          return Promise.all([
            invalidDelete,
            invalidPatch,
            invalidPost,
            invalidPut
          ]).then(([delRes, patchRes, postRes, putRes]) => {
            expect(delRes.body.msg).to.equal(
              "Requested method on URL is unavailable."
            );
            expect(patchRes.body.msg).to.equal(
              "Requested method on URL is unavailable."
            );
            expect(postRes.body.msg).to.equal(
              "Requested method on URL is unavailable."
            );
            expect(putRes.body.msg).to.equal(
              "Requested method on URL is unavailable."
            );
          });
        });
      });
    });
    describe("/articles - ERR", () => {
      describe("GET", () => {
        it("GET:400 on / when passed a misspelt/nonexistant column name in sort_by query", () => {
          return request(app)
            .get("/api/articles?sort_by=auther")
            .expect(400)
            .then(response => {
              expect(response.body.msg).to.equal(
                "Invalid column name in query."
              );
            });
        });
        it("GET:400 on / when passed an order query thats not asc or desc", () => {
          return request(app)
            .get("/api/articles?order=down")
            .expect(400)
            .then(response => {
              expect(response.body.msg).to.equal("Invalid order query.");
            });
        });
        it("GET:400 on / when passed a query parameter that isnt available", () => {
          return request(app)
            .get("/api/articles?title=shorttitle")
            .expect(400)
            .then(response => {
              expect(response.body.msg).to.equal("Invalid query parameter.");
            });
        });
        it("GET:404 on / when passed an author or topic that doesnt exist in the query", () => {
          const badTopic = request(app)
            .get("/api/articles?topic=stjfxgntsj")
            .expect(404);
          const badAuthor = request(app)
            .get("/api/articles?author=gntysthgtrw4r")
            .expect(404);
          return Promise.all([badTopic, badAuthor]).then(
            ([badTopic, badAuthor]) => {
              expect(badTopic.body.msg).to.equal("Topic doesnt exist.");
              expect(badAuthor.body.msg).to.equal("User does not exist.");
            }
          );
        });
      });
      describe("POST", () => {
        it("POST:400 on / when passed missing data in body", () => {
          const missingUsername = request(app)
            .post("/api/articles")
            .send({
              title: "Test article",
              topic: "cats",
              body: "This is a test article."
            })
            .expect(400);

          const missingBody = request(app)
            .post("/api/articles")
            .send({
              title: "Test article",
              topic: "cats",
              username: "rogersop"
            })
            .expect(400);

          const missingTitle = request(app)
            .post("/api/articles")
            .send({
              body: "Test article",
              topic: "cats",
              username: "rogersop"
            })
            .expect(400);

          const missingTopic = request(app)
            .post("/api/articles")
            .send({
              title: "Test article",
              body: "cats",
              username: "rogersop"
            })
            .expect(400);

          return Promise.all([
            missingUsername,
            missingBody,
            missingTitle,
            missingTopic
          ]).then(missingResponses => {
            expect(
              missingResponses.every(
                response => response.body.msg === "Missing data in request."
              )
            ).to.be.true;
          });
        });
      });
      describe("UNAVAILABLE METHODS", () => {
        it("*:405 on / returns invalid method message", () => {
          const invalidPatch = request(app)
            .patch("/api/articles")
            .expect(405);

          const invalidPut = request(app)
            .put("/api/articles")
            .expect(405);

          const invalidDelete = request(app)
            .delete("/api/articles")
            .expect(405);

          return Promise.all([invalidDelete, invalidPatch, invalidPut]).then(
            ([delRes, patchRes, putRes]) => {
              expect(delRes.body.msg).to.equal(
                "Requested method on URL is unavailable."
              );
              expect(patchRes.body.msg).to.equal(
                "Requested method on URL is unavailable."
              );
              expect(putRes.body.msg).to.equal(
                "Requested method on URL is unavailable."
              );
            }
          );
        });
      });
      describe("/:article_id", () => {
        describe("GET", () => {
          it("GET:404 on / when passed a valid article id that doesnt exist in the db", () => {
            return request(app)
              .get("/api/articles/123456")
              .expect(404)
              .then(response => {
                expect(response.body.msg).to.equal("Article doesnt exist.");
              });
          });
          it("GET:400 on / when passed an id too long for postgres", () => {
            return request(app)
              .get("/api/articles/9999999999")
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid ID (number too long)."
                );
              });
          });
          it("GET:400 on / when passed an invalid id data type", () => {
            return request(app)
              .get("/api/articles/12re")
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data type (integer needed)."
                );
              });
          });
        });
        describe("PATCH", () => {
          it("PATCH:404 on / when passed a valid article id that doesnt exist in the db", () => {
            return request(app)
              .patch("/api/articles/123456")
              .send({ inc_votes: 1 })
              .expect(404)
              .then(response => {
                expect(response.body.msg).to.equal("Article doesnt exist.");
              });
          });
          it("PATCH:400 on / when passed an id too long for postgres", () => {
            return request(app)
              .patch("/api/articles/9999999999")
              .send({ inc_votes: 1 })
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid ID (number too long)."
                );
              });
          });
          it("PATCH:400 on / when passed an invalid id data type", () => {
            return request(app)
              .patch("/api/articles/12re")
              .send({ inc_votes: 1 })
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data type (integer needed)."
                );
              });
          });
          it("PATCH:400 on / when the passed body contains no inc_votes", () => {
            return request(app)
              .patch("/api/articles/1")
              .send({})
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data (missing inc_votes)."
                );
              });
          });
          it("PATCH:400 on / when the passed body contains invalid value for inc_votes", () => {
            return request(app)
              .patch("/api/articles/1")
              .send({ inc_votes: "abc" })
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data type (integer needed)."
                );
              });
          });
        });
        describe("DELETE", () => {
          it("DELETE:404 on / when passed valid id that doesnt exist", () => {
            return request(app)
              .delete("/api/articles/235434")
              .expect(404)
              .then(response => {
                expect(response.body.msg).to.equal("Article doesnt exist.");
              });
          });
          it("DELETE:400 on / when passed an invalid id data type", () => {
            return request(app)
              .delete("/api/articles/12re")
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data type (integer needed)."
                );
              });
          });
        });
        describe("UNAVAILABLE METHODS", () => {
          it("*:405 on / returns invalid method message", () => {
            const invalidPost = request(app)
              .post("/api/articles/1")
              .expect(405);

            const invalidPut = request(app)
              .put("/api/articles/1")
              .expect(405);

            return Promise.all([invalidPost, invalidPut]).then(
              ([postRes, putRes]) => {
                expect(postRes.body.msg).to.equal(
                  "Requested method on URL is unavailable."
                );
                expect(putRes.body.msg).to.equal(
                  "Requested method on URL is unavailable."
                );
              }
            );
          });
        });
        describe("/comments", () => {
          describe("GET", () => {
            it("GET:404 on / when passed a valid id that doesnt exist in the db", () => {
              return request(app)
                .get("/api/articles/123456/comments")
                .expect(404)
                .then(response => {
                  expect(response.body.msg).to.equal("Article doesnt exist.");
                });
            });
            it("GET:400 on / when passed an id too long for postgres", () => {
              return request(app)
                .get("/api/articles/9999999999/comments")
                .expect(400)
                .then(response => {
                  expect(response.body.msg).to.equal(
                    "Invalid ID (number too long)."
                  );
                });
            });
            it("GET:400 on / when passed an invalid id data type", () => {
              return request(app)
                .get("/api/articles/a/comments")
                .expect(400)
                .then(response => {
                  expect(response.body.msg).to.equal(
                    "Invalid data type (integer needed)."
                  );
                });
            });
            it("GET:400 on / when passed a misspelt/nonexistant column name in sort_by query", () => {
              return request(app)
                .get("/api/articles/1/comments?sort_by=vote")
                .expect(400)
                .then(response => {
                  expect(response.body.msg).to.equal(
                    "Invalid column name in query."
                  );
                });
            });
            it("GET:400 on / when passed an order query thats not asc or desc", () => {
              return request(app)
                .get("/api/articles/1/comments?order=down")
                .expect(400)
                .then(response => {
                  expect(response.body.msg).to.equal("Invalid order query.");
                });
            });
          });
          describe("POST", () => {
            it("POST:404 on / when passed valid id that doesnt exist", () => {
              return request(app)
                .post("/api/articles/123456/comments")
                .send({ username: "rogersop", body: "This is a test comment" })
                .expect(404)
                .then(response => {
                  expect(response.body.msg).to.equal(
                    "Specified ID does not exist."
                  );
                });
            });
            it("POST:400 on / when passed an invalid id data type in path", () => {
              return request(app)
                .post("/api/articles/a/comments")
                .send({ username: "rogersop", body: "This is a test comment" })
                .expect(400)
                .then(response => {
                  expect(response.body.msg).to.equal(
                    "Invalid data type (integer needed)."
                  );
                });
            });
            it("POST:400 on / when passed missing data in body", () => {
              const missingUsername = request(app)
                .post("/api/articles/1/comments")
                .send({ body: "This is a test comment" })
                .expect(400);

              const missingBody = request(app)
                .post("/api/articles/1/comments")
                .send({ username: "rogersop" })
                .expect(400);

              return Promise.all([missingUsername, missingBody]).then(
                ([missingUsername, missingBody]) => {
                  expect(missingBody.body.msg).to.equal(
                    "Missing data in request."
                  );
                  expect(missingUsername.body.msg).to.equal(
                    "Missing data in request."
                  );
                }
              );
            });
          });
          describe("UNAVAILABLE METHODS", () => {
            it("*:405 on / returns invalid method message", () => {
              const invalidPatch = request(app)
                .patch("/api/articles/1/comments")
                .expect(405);

              const invalidPut = request(app)
                .put("/api/articles/1/comments")
                .expect(405);

              const invalidDelete = request(app)
                .delete("/api/articles/1/comments")
                .expect(405);

              return Promise.all([
                invalidDelete,
                invalidPatch,
                invalidPut
              ]).then(([delRes, patchRes, putRes]) => {
                expect(delRes.body.msg).to.equal(
                  "Requested method on URL is unavailable."
                );
                expect(patchRes.body.msg).to.equal(
                  "Requested method on URL is unavailable."
                );
                expect(putRes.body.msg).to.equal(
                  "Requested method on URL is unavailable."
                );
              });
            });
          });
        });
      });
    });
    describe("/comments - ERR", () => {
      describe("/:comment_id", () => {
        describe("PATCH", () => {
          it("PATCH:404 on / when passed valid id that doesnt exist", () => {
            return request(app)
              .patch("/api/comments/123456")
              .send({ inc_votes: 1 })
              .expect(404)
              .then(response => {
                expect(response.body.msg).to.equal("Comment does not exist.");
              });
          });
          it("PATCH:400 on / when passed an invalid id data type", () => {
            return request(app)
              .patch("/api/comments/123re")
              .send({ inc_votes: 1 })
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data type (integer needed)."
                );
              });
          });
          it("PATCH:400 on / when passed body is missing inc_votes", () => {
            return request(app)
              .patch("/api/comments/1")
              .send({ inc_vote: 1 })
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data (missing inc_votes)"
                );
              });
          });
        });
        describe("DELETE", () => {
          it("DELETE:404 on / when passed valid id that doesnt exist", () => {
            return request(app)
              .delete("/api/comments/235434")
              .expect(404)
              .then(response => {
                expect(response.body.msg).to.equal("Comment does not exist.");
              });
          });
          it("DELETE:400 on / when passed an invalid id data type", () => {
            return request(app)
              .delete("/api/comments/12re")
              .expect(400)
              .then(response => {
                expect(response.body.msg).to.equal(
                  "Invalid data type (integer needed)."
                );
              });
          });
        });
        describe("UNAVAILABLE METHODS", () => {
          it("*:405 on / returns invalid method message", () => {
            const invalidPost = request(app)
              .post("/api/comments/1")
              .expect(405);

            const invalidPut = request(app)
              .put("/api/comments/1")
              .expect(405);

            return Promise.all([invalidPost, invalidPut]).then(
              ([postRes, putRes]) => {
                expect(postRes.body.msg).to.equal(
                  "Requested method on URL is unavailable."
                );
                expect(putRes.body.msg).to.equal(
                  "Requested method on URL is unavailable."
                );
              }
            );
          });
        });
      });
    });
  });

  describe("no extra GET paths", () => {
    it("returns 404 when passed /...(doesnt exist).", () => {
      return request(app)
        .get("/api/jhtdfjhgvkjyf")
        .expect(404)
        .then(response => {
          expect(response.body.msg).to.equal("Requested URL doesnt exist.");
        });
    });
    it("returns 404 when passed /api/...(doesnt exist).", () => {
      return request(app)
        .get("/api/jhtdfjhgvkjyf")
        .expect(404)
        .then(response => {
          expect(response.body.msg).to.equal("Requested URL doesnt exist.");
        });
    });
  });
});
