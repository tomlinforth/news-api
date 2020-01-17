# News API

#### Link to hosted heroku app: https://toms-news-api.herokuapp.com/api

## Summary

This is an api serving information on articles and their respective users/topics/comments.
Data can be accessed and changed by specific endpoints detailed on the /api path.
Developed using knex, pg and express, tested using mocha,chai and supertest.

## Cloning the project

To clone this project into your files, first fork it onto your own github using the fork button near the top right.
Then press clone or download and paste the given link into a git clone command looking like this:

```
git clone https://github.com/YOUR_USERNAME/news-api.git
```

- Remember to run this command in the directory you want the project saved in.

## Dependencies

As stated before, this program was developed using knex, pg and express and was tested using mocha, chai and supertest.
Therefore, to install these dependencies you will need to run the following commands **in the project's directory**:

- `npm install kneg pg express`
- `npm i -D mocha chai supertest chai-sorted chai-things`

## Seeding the databases

To seed the databases, they first need to be setup using:

```
npm run setup-dbs
```

This will create both the test and development databases.

With them created, you can now run `npm run seed` and `npm run test-seed`
to populate the development database and test database with the development and test data respectively.

Additionally, the command `npm run test-utils` will run mocha tests on the **/spec/utils.spec.js** file (_for testing utility functions_)
and the command `npm test` will run mocha tests on the **/spec/app.spec.js** file (_for testing server endpoints_)

## knexfile.js

You will also need a knexfile.js in the root, which will need to export specific config options looking similar to this:

```js
const dbConfig = {
  development: {
    client: "pg",
    connection: {
      database: "database_name"
    },
    seeds: {
      directory: "./db/seeds"
    }
  },
  test: {
    client: "pg",
    connection: {
      database: "database_name_test"
    },
    seeds: {
      directory: "./db/seeds"
    }
  }
};
```

More information about the knex config options can be found here: http://knexjs.org/#Installation-client

Exporting the config will also require that you set an ENV property at the top of the file, like this:

```js
const ENV = process.env.NODE_ENV || "development";
```

This sets the ENV variable to whatever environment has been specified (by different commands), defaulting to 'development'. To change the export
based on this variable, simply add

```js
module.exports = dbConfig[ENV];
```

to the bottom of the file.

### Minimum versions for Node.js and Postgres

Node.js - 12.12.0

Postgres - 10.10
