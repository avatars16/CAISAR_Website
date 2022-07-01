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

async function newCommittee(name, committee) {
    return new Promise(async (resolve, reject) => {
        if (name == null)
            return reject(ApiError.badRequest("Name is required"));
        if (await getCommitteeByName(name))
            return reject(ApiError.badRequest("Name already exists"));
        let newCommittee = {
            startDate: new Date(),
            committeeName: name,
            committeeSlug: await createCommitteeSlug(name),
        };
        if (committee.startDate)
            newCommittee["startDate"] = committee.startDate;
        if (committee.endDate) newCommittee["endDate"] = committee.endDate;
        let err = await addNewRow("committees", newCommittee);
        if (err instanceof ApiError) return reject(err);
        return resolve("committee created");
    });
}

//The part which checks if name is already taken is incorrect
//Problem is that create slug will always create a unique one
//Cant acces the old name, cause it is not explicitly saved in the req
function updateCommittee(committee, committeeSlug, oldName) {
    return new Promise(async (resolve, reject) => {
        err = await updateRow("committees", committee, {
            committeeSlug: committeeSlug,
        });
        if (err instanceof ApiError) return reject(err);
        return resolve("committee updated!");
    });
}

function deleteCommittee(committeeName) {
    return new Promise(async (resolve, reject) => {
        let allResults = await getCommitteeMembers({
            committeeName: committeeName,
        });
        for (result of allResults) {
            err = await deleteRow("committees", {
                committeeId: await result.committeeId,
            });
            if (err instanceof ApiError) return reject(err);
        }
        return resolve("committee deleted!");
    });
}

function addMemberToCommittee(committeeName, user) {
    return new Promise(async (resolve, reject) => {
        if (!(await getCommitteeByName(committeeName)))
            return reject(
                ApiError.badRequest("This committee does not exists")
            );
        newRow = {
            startDate: new Date(),
            committeeName: committeeName,
            userId: user.userId,
        };
        err = await addNewRow("committees", newRow);
        if (err instanceof ApiError) return reject(err);
        return resolve("user updated!");
    });
}

function updateMemberInCommittee(committee, userId) {
    return new Promise(async (resolve, reject) => {
        err = await updateRow("committees", committee, { userId: userId });
        if (err instanceof ApiError) return reject(err);
        return resolve("Member in committee updated!");
    });
}

function deleteMemberInCommittee(committee, userId) {
    return new Promise(async (resolve, reject) => {
        err = await deleteRow("committees", { userId: userId });
        if (err instanceof ApiError) return reject(err);
        return resolve("Member in committee updated!");
    });
}

async function getCommitteeByName(committeeName) {
    return await getCommittee({ committeeName: committeeName });
}

async function getCommitteeBySlug(committeeSlug) {
    return await getCommittee({ committeeSlug: committeeSlug });
}

async function getCommittee(jsonQueryObject) {
    //for example to get user by email: getUser({ email: userEmail})
    return (await getAllCommitteeRows(jsonQueryObject))[0];
}

async function getMemberRoleInCommittee(committeeName, memberId) {
    let filter = { committeeName: committeeName, userId: memberId };
    let data = await getSpecificRows("committees", "memberRole", filter);
    if (data instanceof ApiError) {
        console.log(data);
        return;
    }
    return data[0];
}

async function getAllCommitteeRows(jsonQueryObject) {
    let data = await getSpecificRows("committees", "*", jsonQueryObject);
    if (data instanceof ApiError) {
        console.log(data);
        return;
    }
    return data;
}

async function getAllCommittees() {
    let data = await getAllRows("committees", "*");
    if (data instanceof ApiError) {
        console.log(data);
        return;
    }
    return data;
}

async function createCommitteeSlug(name) {
    var slugName = slugify(name, { lower: true, strict: true });
    let data = await getCommitteeBySlug(slugName);
    if (data == null) return slugName;
    var i = 0;
    newSlugName = slugify(name + i, { lower: true, strict: true });
    while (await getCommitteeBySlug(newSlugName)) {
        i++;
        newSlugName = slugify(name + i, { lower: true, strict: true });
    }
    return newSlugName;
}

//Haven't looked at this function yet
async function searchCommittee(searchItem) {
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
    newCommittee,
    updateCommittee,
    deleteCommittee,
    addMemberToCommittee,
    updateMemberInCommittee,
    deleteMemberInCommittee,
    getAllCommittees,
    getCommitteeBySlug,
    getMemberRoleInCommittee,
    getCommitteeByName,
};
