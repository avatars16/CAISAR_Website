const bcrypt = require("bcrypt");
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
const ApiError = require("../utils/error/data-errors");
const data = require("../permissions/data");

function userObject() {
    return {
        firstName: "test",
        middleName: undefined,
        lastName: "test",
        postalcode: "1234AB",
        adress: "street",
        houseNumber: 1,
        suffix: undefined,
        phone: "06-12345678",
        birthday: undefined,
        email: "test@test.com",
        password: undefined,
        websiteRole: undefined,
    };
}
async function createUser(newUser) {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    helper.deleteEmptyFields(newUser);
    newUser.password = hashedPassword;
    newUser.createdAt = new Date();
    let fullName = newUser.firstName + newUser.lastName;
    if (newUser.middleName)
        fullName = newUser.firstName + newUser.middleName + newUser.lastName;
    newUser.userURL = await createURL(fullName);
    return newUser;
}

async function saveUser(newUser) {
    //REMARK! data can be an error
    let data = await addNewRow("users", newUser);
    return data;
}
function updateUser(user, userId, oldEmail) {
    return new Promise(async (resolve, reject) => {
        // [ ] TODO: Add that board members can not promote to admins
        // [ ] TODO: Add that there has to be one admin minimum
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

async function createURL(fullName) {
    var slugName = slugify(fullName, { lower: true, strict: true });
    let data = await getUser({ userURL: slugName });
    if (data == null) return slugName;
    var i = 0;
    newSlugName = slugify(fullName + i, { lower: true, strict: true });
    while ((await getUser({ userURL: newSlugName })) != null) {
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

async function getUserByURL(userURL) {
    return await getUser({ userURL: userURL });
}

async function getUserByMail(inputEmail) {
    return await getUser({ email: inputEmail });
}

async function getAllUsers() {
    let data = await getAllRows("users", "*");
    if (data instanceof ApiError) {
        return data;
    }
    return data;
}

async function getUser(jsonQueryObject) {
    //for example to get user by email: getUser({ email: userEmail})
    let data = await getSpecificRows("users", "*", jsonQueryObject);
    if (data instanceof ApiError) {
        return data;
    }
    return data[0];
}

async function userLoginStatisticsUpdate(currentInlogCount, userId) {
    try {
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

async function updateProfileViews(currentProfileViews, userId) {
    try {
        await updateRow(
            "users",
            { profileViews: currentProfileViews + 1 },
            { userId: userId }
        );
        return true;
    } catch (error) {
        return error;
    }
}
module.exports = {
    userObject,
    createUser,
    saveUser,
    checkIfUserExists,
    getUser,
    getUserByMail,
    getUserByURL,
    updateUser,
    deleteUser,
    getAllUsers,
    userLoginStatisticsUpdate,
    updateProfileViews,
};
