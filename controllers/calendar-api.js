const slugify = require("slugify");
const marked = require("marked");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);
const ApiError = require("../error/data-errors");
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

async function newCalendarItem(calendarItem) {
    return new Promise(async (resolve, reject) => {
        let newCalendarItem = helper.deleteEmptyFields(calendarItem);
        //TODO: add more field checks
        if (!calendarItem.itemTitle)
            return reject(ApiError.badRequest("Title is required"));
        if (!calendarItem.itemDescription)
            return reject(ApiError.badRequest("Description is required"));
        if (!calendarItem.itemMarkdown)
            return reject(ApiError.badRequest("Markdown is required"));
        newCalendarItem.calendarSlug = await createCalendarItemSlug(
            newCalendarItem.itemTitle
        );
        newCalendarItem.itemHTML = dompurify.sanitize(
            marked.parse(newCalendarItem.itemMarkdown)
        );
        let err = await addNewRow("calendar", newCalendarItem);
        if (err instanceof ApiError) return reject(err);
        return resolve("committee created");
    });
}

function updateCalendarItem(calendarItem) {
    return new Promise(async (resolve, reject) => {
        helper.deleteEmptyFields(calendarItem);
        calendarItem.itemHTML = dompurify.sanitize(
            marked.parse(calendarItem.itemMarkdown)
        );
        err = await updateRow("calendar", calendarItem, {
            calendarSlug: calendarItem.calendarSlug,
        });
        if (err instanceof ApiError) return reject(err);
        return resolve("calendar item updated!");
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
    newCalendarItem,
    updateCalendarItem,
    getCalendarItemBySlug,
    getAllCalendarItems,
};
