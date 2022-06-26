const bcrypt = require("bcrypt");
const passport = require("passport");
const db_generic = require("../models/db_generic");
const { createSearchQuery, insertNewRow } = require("../models/db_interaction");

async function checkIfUserExists(inputEmail) {
    var data = await getUser({ email: inputEmail });
    if (data == null) {
        return false;
    }
    return true;
}

async function getUser(jsonQueryObject) {
    filters = createSearchQuery(jsonQueryObject);
    sql = `SELECT * FROM users WHERE ${filters} `;
    data = await db_generic.dbGetRows(sql);
    return data[0];
}

module.exports = {
    checkIfUserExists,
    getUser,
};
