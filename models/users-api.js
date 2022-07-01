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
const slugify = require("slugify");
const ApiError = require("../error/data-errors");
const apiErrorHandler = require("../error/error-handler");
const data = require("./data");
const { search } = require("../routes");

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
    if (userParam.websiteRole) newUser["websiteRole"] = userParam.role;
    if (userParam.middleName) newUser["middleName"] = userParam.middleName;
    if (userParam.birthday) newUser["birthday"] = userParam.birthday;
    return newUser;
}

async function saveUser(userParam) {
    let data = await addNewRow("users", userParam);
    return data;
}
function updateUser(user, userId, oldEmail) {
    return new Promise(async (resolve, reject) => {
        if (user.password != "")
            user.password = await bcrypt.hash(user.password, 10);
        else delete user.password;
        if (oldEmail != user.email && (await checkIfUserExists(user.email)))
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
    let data = await getUser({ slugURL: slugName });
    if (data == null) return slugName;
    var i = 0;
    newSlugName = slugify(fullName + i, { lower: true, strict: true });
    while (await getUser({ slugURL: newSlugName })) {
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
    return await getUser({ slugURL: userSlug });
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

async function searchUser(searchItem) {
    return new Promise(async (resolve, reject) => {
        let data = await searchInColumns(
            "users",
            "*",
            searchItem + "% ",
            "lastName"
        );
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
};
