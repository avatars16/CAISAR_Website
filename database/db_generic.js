//const sqlite3 = require("sqlite3").verbose();
//const db = new sqlite3.Database('./Users.db',sqlite3.OPEN_READWRITE);

const mysql = require("mysql");
const ApiError = require("../error/data-errors");

function getConn() {
    let db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "caisar",
    });

    db.connect((err) => {
        if (err) {
            throw err;
        }
    });
    return db;
}

function dbQuery(sql, placeholders) {
    console.log("dbQuery sql: " + sql);
    console.info(placeholders);

    return new Promise((resolve, reject) => {
        var db = getConn();
        db.query(sql, placeholders, (err, result, fields) => {
            if (err) {
                return reject(ApiError.internal("Invalid database query"));
            }
            return resolve(result);
        });
        db.end();
    });
}

module.exports = { dbQuery, getConn };
