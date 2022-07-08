const bcrypt = require("bcrypt");
const passport = require("passport");
const db_generic = require("../database/db_generic");
const {
    updateRow,
    addNewRow,
    deleteRow,
    getSpecificRows,
    getAllRows,
    searchInColumns,
} = require("../database/db_interaction");
const helper = require("./helper-functions");
const slugify = require("slugify");
const ApiError = require("../error/data-errors");
const apiErrorHandler = require("../error/error-handler");
const data = require("./data");
const { search } = require("../routes");

async function createUser(newUser) {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    helper.deleteEmptyFields(newUser);
    newUser.password = hashedPassword;
    newUser.createdAt = new Date();
    let fullName = newUser.firstName + newUser.lastName;
    if (newUser.middleName)
        fullName = newUser.firstName + newUser.middleName + newUser.lastName;
    newUser.userSlug = await createSlug(fullName);
    return newUser;
}

async function saveUser(newUser) {
    let data = await addNewRow("users", newUser);
    return data;
}
function updateUser(user, userId, oldEmail) {
    return new Promise(async (resolve, reject) => {
        helper.deleteEmptyFields(user);
        if (user.password) user.password = await bcrypt.hash(user.password, 10);
        if (
            user.email &&
            oldEmail != user.email &&
            (await checkIfUserExists(user.email))
        )
            return reject(
                ApiError.badRequest("email already taken by another user")
            );
        err = await updateRow("users", user, { userId: userId });
        if (err instanceof ApiError) return reject(err);
        return resolve("user updated!");
    });
}

function deleteUser(user) {
    return new Promise(async (resolve, reject) => {
        err = await deleteRow("users", { userId: user.userId });
        if (err instanceof ApiError) return reject(err);
        return resolve("user updated!");
    });
}

async function createSlug(fullName) {
    var slugName = slugify(fullName, { lower: true, strict: true });
    let data = await getUser({ userSlug: slugName });
    if (data == null) return slugName;
    var i = 0;
    newSlugName = slugify(fullName + i, { lower: true, strict: true });
    while (await getUser({ userSlug: newSlugName })) {
        i++;
        newSlugName = slugify(fullName + i, { lower: true, strict: true });
    }
    return newSlugName;
}

async function checkIfUserExists(inputEmail) {
    var data = await getUserByMail(inputEmail);
    if (data == null) {
        return false;
    }
    return true;
}

async function getUserBySlug(userSlug) {
    return await getUser({ userSlug: userSlug });
}

async function getUserByMail(inputEmail) {
    return await getUser({ email: inputEmail });
}

async function getAllUsers() {
    let data = await getAllRows("users", "*");
    if (data instanceof ApiError) {
        console.log(data);
        return;
    }
    return data;
}

async function getUser(jsonQueryObject) {
    //for example to get user by email: getUser({ email: userEmail})
    let data = await getSpecificRows("users", "*", jsonQueryObject);
    if (data instanceof ApiError) {
        console.log(data);
        return;
    }
    return data[0];
}

async function userLoginStatisticsUpdate(currentInlogCount, userId) {
    try {
        console.log(new Date());
        await updateRow(
            "users",
            { numberOfLogins: currentInlogCount + 1, lastLogin: new Date() },
            { userId: userId }
        );
        return true;
    } catch (error) {
        return error;
    }
}

async function searchUserByName(filterItem, n) {
    try {
        let filterStmt = filterItem + "%";
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
        if (users instanceof ApiError) {
            return users;
        }
        return users;
    } catch (err) {
        return err;
    }
}

async function searchUser(getColumns, filter, n) {
    return new Promise(async (resolve, reject) => {
        let data = await searchInColumns("users", getColumns, filter, n);
        if (data instanceof ApiError) return reject(data);
        return resolve(data);
    });
}
module.exports = {
    createUser,
    saveUser,
    checkIfUserExists,
    getUser,
    getUserByMail,
    getUserBySlug,
    updateUser,
    deleteUser,
    getAllUsers,
    searchUser,
    searchUserByName,
    userLoginStatisticsUpdate,
};
