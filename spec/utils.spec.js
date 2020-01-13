process.env.NODE_ENV;
const { expect } = require("chai");
const {
  formatDates,
  makeRefObj,
  formatComments
} = require("../db/utils/utils");

describe("formatDates", () => {
  it("returns an empty array when passed an empty array", () => {
    expect(formatDates([])).to.eql([]);
  });
  it("returns a correctly formatted date object from single element array", () => {
    const outputDate = new Date(1542284514171);
    expect(formatDates([{ created_at: 1542284514171 }])).to.eql([
      { created_at: outputDate }
    ]);
  });
  it("returns a correctly formatted date object from single element array, without changing any other data", () => {
    const input = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const output = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: new Date(1542284514171),
        votes: 100
      }
    ];
    expect(formatDates(input)).to.eql(output);
  });
  it("returns a formatted array of multiple articles", () => {
    const input = [
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      },
      {
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body:
          "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: 1163852514171
      }
    ];
    const output = [
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: new Date(1289996514171)
      },
      {
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body:
          "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: new Date(1163852514171)
      }
    ];
    expect(formatDates(input)).to.eql(output);
  });
  it("doesnt mutate the input array", () => {
    const input = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    expect(formatDates(input)).to.not.equal(input);
    expect(formatDates(input)[0]).to.not.equal(input[0]);
  });
});

describe("makeRefObj", () => {
  it("returns an empty array when passed an empty object", () => {
    expect(makeRefObj([])).to.eql({});
  });
  it("returns a valid reference object of one article", () => {
    expect(makeRefObj([{ article_id: 1, title: "abc" }])).to.eql({ abc: 1 });
  });
  it("returns a valid reference object of multiple articles", () => {
    expect(
      makeRefObj([
        { article_id: 1, title: "abc" },
        { article_id: 2, title: "xyz" },
        { article_id: 5, title: "grjdbsrargr" }
      ])
    ).to.eql({ abc: 1, xyz: 2, grjdbsrargr: 5 });
  });
  it("doesnt mutate the input array", () => {
    const input = [{ article_id: 1, title: "abc" }];
    expect(makeRefObj(input)).to.not.equal(input);
  });
});

describe("formatComments", () => {
  it("returns an empty array when passed an empty array and ref obj", () => {
    expect(formatComments([], {})).to.eql([]);
  });
  it("returns one formatted comment, correctly utilising ref obj", () => {
    const input = [
      {
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        created_at: 1511354163389
      }
    ];
    const articleRef = { "They're not exactly dogs, are they?": 15 };
    const output = [
      {
        article_id: 15,
        author: "butter_bridge",
        created_at: new Date(1511354163389)
      }
    ];
    expect(formatComments(input, articleRef)).to.eql(output);
  });
  it("returns one formatted comment, correctly utilising ref obj without changing other data", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const articleRef = { "They're not exactly dogs, are they?": 15 };
    const output = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        article_id: 15,
        author: "butter_bridge",
        votes: 16,
        created_at: new Date(1511354163389)
      }
    ];
    expect(formatComments(input, articleRef)).to.eql(output);
  });
  it("returns multiple formatted comments, utilising the ref obj", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      },
      {
        body:
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge",
        votes: 14,
        created_at: 1479818163389
      }
    ];
    const articleRef = {
      "They're not exactly dogs, are they?": 15,
      "Living in the shadow of a great man": 3
    };
    const output = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        article_id: 15,
        author: "butter_bridge",
        votes: 16,
        created_at: new Date(1511354163389)
      },
      {
        body:
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        article_id: 3,
        author: "butter_bridge",
        votes: 14,
        created_at: new Date(1479818163389)
      }
    ];
    expect(formatComments(input, articleRef)).to.eql(output);
  });
  it("doesnt mutate the input array", () => {
    const input = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const articleRef = { "They're not exactly dogs, are they?": 15 };
    expect(formatComments(input, articleRef)).to.not.equal(input);
    expect(formatComments(input, articleRef)[0]).to.not.equal(input[0]);
  });
});
