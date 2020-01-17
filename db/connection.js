const ENV = process.env.NODE_ENV || "development";
const knex = require("knex");

const config =
  ENV === "production"
    ? { client: "pg", connection: process.env.DATABASE_URL }
    : require("../knexfile");

const connection = knex(config);

module.exports = connection;
