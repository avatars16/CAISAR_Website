const { getConn } = require("./db_generic");

async function createUsersTable(req, res, next) {
    let names =
        "firstName VARCHAR(255) NOT NULL, middleName VARCHAR(255), lastName VARCHAR(255) NOT NULL, ";
    let adress =
        "postalcode varchar(255)  NOT NULL, adress varchar(255)  NOT NULL ,houseNumber INT NOT NULL ,`suffix` int  NULL ,";
    let credential =
        "email VARCHAR(255) NOT NULL, password text NOT NULL, private BOOLEAN DEFAULT false,";
    let personal = "phone VARCHAR(255) NOT NULL, birthday DATE NULL,";
    let statistics =
        "createdAt DATE DEFAULT CURRENT_DATE(), lastLogin DATE DEFAULT CURRENT_DATE(), numberOfLogins int DEFAULT 0, profileViews int DEFAULT 0, ";
    let sql =
        "CREATE TABLE users(userId int AUTO_INCREMENT,userURL VARCHAR(255) NOT NULL, websiteRole VARCHAR(255) DEFAULT 'user', " +
        names +
        adress +
        personal +
        credential +
        statistics +
        "  PRIMARY KEY(userId)) ";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) next(err);
    });
}

async function createCommitteesTable(req, res, next) {
    let date = "startDate DATE DEFAULT CURRENT_DATE(), endDate DATE,";
    let name =
        "committeeName VARCHAR(255) NOT NULL, committeeURL VARCHAR(255) NOT NULL,";
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
        if (err) next(err);
    });
}

async function createPagesTable(req, res, next) {
    //TODO: Possible add multiple URL foreign keys (to users, committees, activities)
    let pageText =
        "pageTitle varchar(255) NOT NULL, pagePreviewMd text NOT NULL, pagePreviewHTML text NOT NULL, pageDescriptionMd text NOT NULL, pageDescriptionHTML text NOT NULL,";
    let pageOther = "pagePicture text NULL, pageNumber int NOT NULL DEFAULT 0,";
    let statistics =
        "createdBy INT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_DATE(), pageViews INT NOT NULL DEFAULT 0,";
    let sql =
        "CREATE TABLE pages(pageId int AUTO_INCREMENT, pageURL VARCHAR NOT NULL," +
        pageText +
        pageOther +
        statistics +
        "PRIMARY KEY(pageId), FOREIGN KEY (createdBy) REFERENCES users(userId))";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) next(err);
    });
}

async function createActivitiesTable(req, res, next) {
    let dates =
        "beginDate DATETIME NOT NULL, endDate DATETIME NOT NULL, signupDate DATETIME NOT NULL, signoutDate DATETIME NOT NULL,";
    let money = "cost INT NOT NULL,";
    let sql =
        "CREATE TABLE activities(activityId int AUTO_INCREMENT, activityURL varchar(255) NOT NULL, userId int NULL, createdBy int NULL," +
        dates +
        money +
        "PRIMARY KEY(activityId), FOREIGN KEY (createdBy) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId))";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) next(err);
    });
}

async function createFinancesTable(req, res, next) {
    let dates =
        "originDate DATE NOT NULL DEFAULT CURRENT_DATE(), processingDate DATE NULL,";
    let finances =
        "financeType VARCHAR(255) NOT NULL, financeDescription VARCHAR(255) NOT NULL,";
    let money = "amount INT NOT NULL, payed BOOLEAN NOT NULL DEFAULT false,";
    let sql =
        "CREATE TABLE finances(financeId int AUTO_INCREMENT, userId int NOT NULL, activityId INT NULL," +
        dates +
        finances +
        money +
        "PRIMARY KEY(financeId), FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY (activityId) REFERENCES activities(activityId))";
    db = getConn();
    db.query(sql, (err, result) => {
        if (err) next(err);
    });
}

module.exports = {
    createUsersTable,
    createCommitteesTable,
    createPagesTable,
    createActivitiesTable,
    createFinancesTable,
};
