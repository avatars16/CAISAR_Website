const bcrypt = require("bcrypt");
const passport = require("passport");
const db_generic = require("../database/db_generic");
const {
    createSearchQuery,
    insertNewRow,
} = require("../database/db_interaction");
const slugify = require("slugify");

async function createUser(userParam) {
    const hashedPassword = await bcrypt.hash(userParam.password, 10);
    let newUser = {
        createdAt: new Date(),
        firstName: userParam.firstName,
        lastName: userParam.lastName,
        email: userParam.email,
        password: hashedPassword,
        slugURL: await createSlug(
            userParam.firstName + userParam.middleName + userParam.lastName
        ),
    };
    if (userParam.role) newUser["websiteRole"] = userParam.role;
    if (userParam.middleName) newUser["middleName"] = userParam.middleName;
    if (userParam.birthday) newUser["birthday"] = userParam.birthday;
    return newUser;
}

async function createSlug(fullName) {
    var slugName = slugify(fullName, { lower: true, strict: true });
    let data = await getUser({ slugURL: slugName });
    if (data == null) return slugName;
    var i = 0;
    newSlugName = slugify(fullName + i, { lower: true, strict: true });
    while (slugName == newSlugName) {
        i++;
        newSlugName = slugify(fullName + i, { lower: true, strict: true });
    }
    return newSlugName;
}

async function checkIfUserExists(inputEmail) {
    var data = await getUser({ email: inputEmail });
    if (data == null) {
        return false;
    }
    return true;
}

async function getUser(jsonQueryObject) {
    //for example to get user by email: getUser({ email: userEmail})
    filters = createSearchQuery(jsonQueryObject);
    sql = `SELECT * FROM users WHERE ${filters} `;
    data = await db_generic.dbGetRows(sql);
    return data[0];
}
module.exports = {
    createUser,
    checkIfUserExists,
    getUser,
};
