const { getConn } = require("./db_generic");

async function createUserTable(req, res) {
    let names =
        "firstName VARCHAR(255), middleName VARCHAR(255), lastName VARCHAR(255),";
    let credential = "email VARCHAR(255), password text, slugURL VARCHAR(255),";
    let sql =
        "CREATE TABLE users(id int AUTO_INCREMENT, createdAt DATETIME, birthday DATETIME, websiteRole VARCHAR(255) DEFAULT 'user', " +
        names +
        credential +
        "  PRIMARY KEY(id)) ";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send("users table created");
    });
}

module.exports = createUserTable;
