//const sqlite3 = require("sqlite3").verbose();
//const db = new sqlite3.Database('./Users.db',sqlite3.OPEN_READWRITE);

const mysql = require("mysql");

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

async function dbQuery(sql, param) {
    console.log("dbQuery sql: " + sql + "params" + param);
    var db = getConn();
    var data = new Promise((resolve, reject) => {
        db.query(sql, param, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
    db.end();
    return data;
}

async function dbGetRows(sql) {
    console.log("dbGetRows sql: " + sql);
    var data = new Promise((resolve, reject) => {
        var db = getConn();
        db.query(sql, (err, result) => {
            if (err) {
                reject(err);
                db.end();
            }
            resolve(result);
            db.end();
        });
    });
    return data;
}

module.exports = { dbQuery, dbGetRows, getConn };
