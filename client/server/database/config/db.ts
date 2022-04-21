import mysql = require("mysql2");

export const db = mysql.createConnection({
    host: "spider.cqrpy1vqvg7t.ap-northeast-2.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "12341234",
    database: "spider",
});
