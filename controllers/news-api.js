const slugify = require("slugify");
const marked = require("marked");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);
const ApiError = require("../utils/error/data-errors");
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

function emptyCalendarItem() {
    return {
        itemTitle: "Title",
        itemDescription: "Description",
        itemMarkdown: "markdown \n### yeaaa boy",
        startDate: undefined,
        endDate: undefined,
        signupDate: undefined,
        signoutDate: undefined,
    };
}

async function newCalendarItem(calendarItem, user) {
    return new Promise(async (resolve, reject) => {
        let newCalendarItem = helper.deleteEmptyFields(calendarItem);
        //TODO: add more field checks
        if (!calendarItem.itemTitle)
            return reject(ApiError.badRequest("Title is required"));
        if (!calendarItem.itemDescription)
            return reject(ApiError.badRequest("Description is required"));
        if (!calendarItem.itemMarkdown)
            return reject(ApiError.badRequest("Markdown is required"));
        //if (!calendarItem.startDate)
        //    return reject(ApiError.badRequest("Start date is required"));
        //if (!calendarItem.endDate)
        //   return reject(ApiError.badRequest("End dateis required"));
        if (calendarItem.signupDate == null)
            calendarItem.signupDate = calendarItem.startDate;
        if (calendarItem.signoutDate == null)
            calendarItem.signoutDate = calendarItem.startDate;
        newCalendarItem.calendarSlug = await createCalendarItemSlug(
            newCalendarItem.itemTitle
        );
        newCalendarItem.itemHTML = dompurify.sanitize(
            marked.parse(newCalendarItem.itemMarkdown)
        );
        newCalendarItem.createdBy = user.userId;
        let err = await addNewRow("calendar", newCalendarItem);
        if (err instanceof ApiError) return reject(err);
        return resolve("committee created");
    });
}

function updateCalendarItem(calendarItem, calendarSlug) {
    return new Promise(async (resolve, reject) => {
        helper.deleteEmptyFields(calendarItem);
        calendarItem.itemHTML = dompurify.sanitize(
            marked.parse(calendarItem.itemMarkdown)
        );
        err = await updateRow("calendar", calendarItem, {
            calendarSlug: calendarSlug,
        });
        if (err instanceof ApiError) return reject(err);
        return resolve("calendar item updated!");
    });
}

function deleteCalendaritem(calendarItem) {
    return new Promise(async (resolve, reject) => {
        err = await deleteRow("calendar", {
            calendarSlug: calendarItem.calendarSlug,
        });
        if (err instanceof ApiError) return reject(err);
        return resolve("item updated!");
    });
}

async function getCalendarItemBySlug(calendarSlug) {
    return await getCalenderItem({ calendarSlug: calendarSlug });
}

async function getCalenderItem(jsonQueryObject) {
    let data = await getSpecificRows("calendar", "*", jsonQueryObject);
    if (data instanceof ApiError) {
        console.log(data);
        return;
    }
    return data[0];
}

async function getAllCalendarItems() {
    let data = await getAllRows("calendar", "*");
    if (data instanceof ApiError) {
        console.log(data);
        return;
    }
    return data;
}

async function createCalendarItemSlug(name) {
    var slugName = slugify(name, { lower: true, strict: true });
    let data = await getCalendarItemBySlug(slugName);
    if (data == null) return slugName;
    var i = 0;
    newSlugName = slugify(name + i, { lower: true, strict: true });
    while (await getCalendarItemBySlug(newSlugName)) {
        i++;
        newSlugName = slugify(name + i, { lower: true, strict: true });
    }
    return newSlugName;
}

module.exports = {
    emptyCalendarItem,
    newCalendarItem,
    updateCalendarItem,
    deleteCalendaritem,
    getCalendarItemBySlug,
    getAllCalendarItems,
};
