const { getConn } = require("./db_generic");

async function createUserTable(req, res) {
    let names =
        "firstName VARCHAR(255) NOT NULL, middleName VARCHAR(255), lastName VARCHAR(255) NOT NULL, ";
    let credential =
        "email VARCHAR(255) NOT NULL, password text NOT NULL, userSlug VARCHAR(255) NOT NULL, ";
    let statistics =
        "createdAt DATE DEFAULT CURRENT_DATE(),lastLogin DATE DEFAULT CURRENT_DATE(), numberOfLogins int DEFAULT 0, profileViews int DEFAULT 0, ";
    let sql =
        "CREATE TABLE users(userId int AUTO_INCREMENT, birthday DATE, websiteRole VARCHAR(255) DEFAULT 'user', " +
        names +
        credential +
        statistics +
        "  PRIMARY KEY(userId)) ";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send("users table created");
    });
}

async function createCommitteeTable(req, res) {
    let date = "startDate DATE DEFAULT CURRENT_DATE(), endDate DATE,";
    let name =
        "committeeName VARCHAR(255) NOT NULL, committeeSlug VARCHAR(255) NOT NULL,";
    let committeeSpecifics =
        "committeeParent VARCHAR(255), committeeType VARCHAR(255) NOT NULL,";
    let sql =
        "CREATE TABLE committees(committeeId int AUTO_INCREMENT, userId int, memberRole VARCHAR(255)," +
        name +
        date +
        committeeSpecifics +
        "  PRIMARY KEY(committeeId), FOREIGN KEY (userId) REFERENCES users(userId))";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send("committee table created");
    });
}

async function createCalenderTable(req, res) {
    let dates =
        "startDate DATE, startTime TIME, endDate DATE, endTime TIME, signupDate DATE, signOutDate DATE,";
    let texts =
        "itemTitle VARCHAR(255) NOT NULL, itemDescription TEXT NOT NULL, itemMarkdown TEXT NOT NULL, itemHTML TEXT NOT NULL,";
    let statistics =
        "calendarSlug VARCHAR(255), createdBy int, views int DEFAULT 0,";
    let sql =
        "CREATE TABLE calendar(calendarId int AUTO_INCREMENT," +
        dates +
        texts +
        statistics +
        "PRIMARY KEY(calendarId), FOREIGN KEY (createdBy) REFERENCES users(userId))";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send("calendar table created");
    });
}

module.exports = { createUserTable, createCommitteeTable, createCalenderTable };
