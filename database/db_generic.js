//const sqlite3 = require("sqlite3").verbose();
//const db = new sqlite3.Database('./Users.db',sqlite3.OPEN_READWRITE);

const mysql = require("mysql");
const ApiError = require("../utils/error/data-errors");
const logger = require("../utils/logger");

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

function dbQuery(sql, parameters) {
    logger.verbose("SQL query", { stmt: sql, parameters: parameters });
    return new Promise((resolve, reject) => {
        var db = getConn();
        db.query(sql, parameters, (err, result, fields) => {
            if (err) {
                return reject(ApiError.internal("Invalid database query", err));
            }
            return resolve(result);
        });
        db.end();
    });
}

function dbSimpleQuery(sql) {
    logger.verbose("SQL query", { stmt: sql });
    return new Promise((resolve, reject) => {
        var db = getConn();
        db.query(sql, (err, result, fields) => {
            if (err) {
                return reject(ApiError.internal("Invalid database query", err));
            }
            return resolve(result);
        });
        db.end();
    });
}

module.exports = { dbQuery, dbSimpleQuery, getConn };
