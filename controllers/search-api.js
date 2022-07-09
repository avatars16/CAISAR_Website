//In this document all middleware functions are stored for searching databases.

const { searchInColumns } = require("../database/db_interaction");
const ApiError = require("../utils/error/data-errors");

async function searchCommitteeByName(req, res, next) {
    let filterStmt = req.body.payload + "%";
    let filter = { committeeName: filterStmt };
    let getColumns = "committeeName, committeeSlug";
    let n = 3; //Number of returned values
    let data = await searchInColumns("users", getColumns, filter, n);
    if (data instanceof ApiError) return next(data);
    res.json({ payload: users });
}

async function searchUserByName(req, res, next) {
    let filterStmt = req.body.payload + "%";
    users = await searchUser(
        "firstName, middleName,lastName,userSlug",
        {
            firstName: filterStmt,
            middleName: filterStmt,
            lastName: filterStmt,
            userSlug: filterStmt,
        },
        3
    );
    if (users instanceof ApiError) return next(users);
    res.json({ payload: users });
}

async function searchUser(getColumns, filter, n) {
    return new Promise(async (resolve, reject) => {
        let data = await searchInColumns("users", getColumns, filter, n);
        if (data instanceof ApiError) return reject(data);
        return resolve(data);
    });
}

module.exports = { searchUserByName, searchCommitteeByName };
