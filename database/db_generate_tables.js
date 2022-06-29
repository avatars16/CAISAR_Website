const { getConn } = require("./db_generic");

async function createUserTable(req, res) {
    let names =
        "firstName VARCHAR(255), middleName VARCHAR(255), lastName VARCHAR(255),";
    let credential = "email VARCHAR(255), password text, slugURL VARCHAR(255),";
    let sql =
        "CREATE TABLE users(id int AUTO_INCREMENT, createdAt DATE, birthday DATE, websiteRole VARCHAR(255) DEFAULT 'user', " +
        names +
        credential +
        "  PRIMARY KEY(id)) ";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send("users table created");
    });
}

async function createUserMembershipsTable(req, res) {
    let date = "startDate DATE DEFAULT CURRENT_DATE(), endDate DATE,";
    let name =
        "committeeName VARCHAR(255) NOT NULL, committeeSlug VARCHAR(255) NOT NULL,";
    let sql =
        "CREATE TABLE committees(committeeId int AUTO_INCREMENT, userId int, memberRole VARCHAR(255) DEFAULT 'member'," +
        date +
        name +
        "  PRIMARY KEY(committeeId), FOREIGN KEY (userId) REFERENCES users(userId))";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send("users table created");
    });
}

module.exports = { createUserTable, createUserMembershipsTable };
