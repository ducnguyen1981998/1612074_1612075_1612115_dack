var pg = require("pg");

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'News',
    password: '123456',
    port: 5433,
});

// var pool =new pg.createConnection({
//     database: 'mytestdb',
//     host: "localhost",
//     user: "root",
//     password: "123456"
// });

module.exports = pool;
