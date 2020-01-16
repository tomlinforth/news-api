exports.formatDates = list => {
  return list.map(obj => {
    const objCopy = { ...obj };
    objCopy.created_at = new Date(objCopy.created_at);
    return objCopy;
  });
};

exports.makeRefObj = list => {
  const refObj = {};
  list.forEach(obj => {
    refObj[obj.title] = obj.article_id;
  });
  return refObj;
};

exports.formatComments = (comments, articleRef) => {
  return comments.map(comment => {
    const commentCopy = { ...comment };
    commentCopy.article_id = articleRef[comment.belongs_to];
    commentCopy.author = comment.created_by;
    commentCopy.created_at = new Date(comment.created_at);
    delete commentCopy.created_by;
    delete commentCopy.belongs_to;
    return commentCopy;
  });
};

exports.createCommentCountRef = countData => {
  const countRef = {};
  countData.forEach(count => {
    countRef[count.article_id] = Number(count.count);
  });
  return countRef;
};

exports.rejectIfInvalidSortOrOrder = (validKeys, query) => {
  if (!validKeys.includes(query.sort_by || "created_at")) {
    return Promise.reject({
      status: 400,
      msg: "Invalid column name in query."
    });
  }
  if (query.order && query.order !== "asc" && query.order !== "desc") {
    return Promise.reject({ status: 400, msg: "Invalid order query." });
  }
};
