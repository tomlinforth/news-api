exports.up = function(knex) {
  return knex.schema.createTable("users", usersTable => {
    usersTable
      .string("username")
      .primary()
      .unique()
      .notNullable();
    usersTable
      .string("avatar_url")
      .defaultTo(
        "https://iupac.org/wp-content/uploads/2018/05/default-avatar.png"
      );
    usersTable.string("name").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("users");
};
