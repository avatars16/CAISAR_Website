const {
    updateRow,
    addNewRow,
    deleteRow,
    getSpecificRows,
    getAllRows,
    searchInColumns,
    updateRowNull,
} = require("../database/db_interaction");
const helper = require("./helper-functions");
const slugify = require("slugify");
const ApiError = require("../utils/error/data-errors");
const data = require("../permissions/data");
const { search } = require("../routes");

// [ ] TODO: Clean up this code, its a mess.

function emptyCommittee() {
    return {
        committeeName: "",
        committeeType: "",
        committeeParent: "",
        startDate: undefined,
        endDate: undefined,
    };
}

async function newCommittee(name, committee) {
    return new Promise(async (resolve, reject) => {
        if (!name) return reject(ApiError.badRequest("Name is required"));
        if (await getCommitteeByName(name))
            return reject(ApiError.badRequest("Name already exists"));
        if (!committee.committeeType)
            return reject(ApiError.badRequest("Type is required"));
        let newCommittee = helper.deleteEmptyFields(committee);
        newCommittee.committeeURL = await createcommitteeURL(
            newCommittee.committeeName
        );
        newCommittee.startDate = new Date();
        if (committee.committeeParent) {
            if (!(await getCommitteeByName(committee.committeeParent)))
                return reject(
                    ApiError.badRequest(
                        `A committee with name: ${committeee.committeeParent} does not exists`
                    )
                );
            newCommittee["committeeParent"] = committee.committeeParent;
        }
        let err = await addNewRow("committees", newCommittee);
        if (err instanceof ApiError) return reject(err);
        return resolve("committee created");
    });
}

function updateCommittee(committee, committeeURL, oldName) {
    return new Promise(async (resolve, reject) => {
        helper.deleteEmptyFields(committee);
        if (committee.committeeName != oldName) {
            if (await getCommitteeByName(committee.committeeName))
                return reject(
                    ApiError.badRequest("Committee name already exists")
                );

            if (committee.committeeParent)
                if (!(await getCommitteeByName(committee.committeeParent)))
                    return reject(
                        ApiError.badRequest(
                            `Committee parent with name ${committee.committeeParent} does not exist`
                        )
                    );

            newcommitteeURL = await createcommitteeURL(committee.committeeName);
            //Update all committee names
            err = await updateRow(
                "committees",
                { committeeName: committee.committeeName },
                { committeeURL: committeeURL }
            );
            if (err instanceof ApiError) return reject(err);
            //Update all committee slugs
            err = await updateRow(
                "committees",
                { committeeURL: newcommitteeURL },
                { committeeName: committee.committeeName }
            );
            //update the committee name in the parent column
            err = await updateRow(
                "committees",
                { committeeParent: committee.committeeName },
                { committeeParent: oldName }
            );

            //update committeeName where name=name and not memberrole
            if (err instanceof ApiError) return reject(err);
            err = await updateRowNull("committees", committee, "memberRole", {
                committeeName: committee.committeeName,
            });
            return resolve("committee updated!");
        } else {
            if (committee.committeeParent)
                if (!(await getCommitteeByName(committee.committeeParent)))
                    return reject(
                        ApiError.badRequest(
                            `Committee parent with name ${committee.committeeParent} does not exist`
                        )
                    );

            err = await updateRow("committees", committee, {
                committeeURL: committeeURL,
            });
            if (err instanceof ApiError) return reject(err);
            return resolve("committee updated!");
        }
    });
}

function deleteCommittee(committeeName) {
    return new Promise(async (resolve, reject) => {
        let allResults = await getAllCommitteeRows({
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

function addMemberToCommittee(committee, user) {
    return new Promise(async (resolve, reject) => {
        if (!committee)
            return reject(
                ApiError.badRequest("This committee does not exists")
            );
        newMember = {
            startDate: new Date(),
            committeeName: committee.committeeName,
            memberRole: "member",
            userId: user.userId,
            committeeURL: committee.committeeURL,
            committeeType: committee.committeeType,
        };
        if (
            (await getMemberRoleInCommittee(
                committee.committeeName,
                user.userId
            )) != null
        )
            return reject(
                ApiError.badRequest(
                    `${user.firstName} is already a member of ${committee.committeeName}`,
                    (redirect = true)
                )
            );
        err = await addNewRow("committees", newMember);
        if (err instanceof ApiError) return reject(err);
        return resolve("user updated!");
    });
}

function updateMemberInCommittee(updatedInfo, userId) {
    return new Promise(async (resolve, reject) => {
        helper.deleteEmptyFields(updatedInfo);
        err = await updateRow("committees", updatedInfo, { userId: userId });
        if (err instanceof ApiError) return reject(err);
        return resolve("Member in committee updated!");
    });
}

function deleteMemberInCommittee(committeeName, userId) {
    return new Promise(async (resolve, reject) => {
        err = await deleteRow("committees", {
            userId,
            committeeName,
        });
        if (err instanceof ApiError) return reject(err);
        return resolve("Member in committee updated!");
    });
}

async function getCommitteeByName(committeeName) {
    return await getCommittee({ committeeName: committeeName });
}

async function getCommitteeBySlug(committeeURL) {
    return await getCommittee({ committeeURL: committeeURL });
}

async function getCommittee(jsonQueryObject) {
    return (await getAllCommitteeRows(jsonQueryObject))[0];
}

async function getMemberRoleInCommittee(committeeName, memberId) {
    let filter = { committeeName: committeeName, userId: memberId };
    let data = await getSpecificRows("committees", "memberRole", filter);
    if (data instanceof ApiError) {
        return data;
    }
    return data[0];
}

async function getAllCommitteesOfType(committeeType) {
    let filter = { committeeType: committeeType };
    return await getAllCommitteeRows(filter);
}

async function getAllCommitteeRows(jsonQueryObject) {
    let data = await getSpecificRows("committees", "*", jsonQueryObject);
    if (data instanceof ApiError) {
        return data;
    }
    return data;
}

async function getAllCommittees() {
    let data = await getAllRows("committees", "*");
    if (data instanceof ApiError) {
        return data;
    }
    return data;
}

async function createcommitteeURL(name) {
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
    emptyCommittee,
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
    getAllCommitteesOfType,
};
