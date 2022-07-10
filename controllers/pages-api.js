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

function emptyPage() {
    return {
        pageTitle: "Title",
        pagePreviewMd: "markdown \n### yeaaa boy",
        pageDescriptionMd: "Description",
        pageNumber: 0,
    };
}

async function newPage(page, user) {
    return new Promise(async (resolve, reject) => {
        let newPage = helper.deleteEmptyFields(page);
        //TODO: add more field checks
        if (!page.pageTitle)
            return reject(ApiError.badRequest("Title is required"));
        if (!page.pageDescriptionMd)
            return reject(ApiError.badRequest("Description is required"));
        if (!page.pagePreviewMd)
            return reject(ApiError.badRequest("Preview is required"));
        newPage.createdAt = new Date();
        newPage.createdBy = user.userId;
        newPage.pageURL = await createPageSlug(newPage.pageTitle);
        newPage.pageDescriptionHTML = dompurify.sanitize(
            marked.parse(newPage.pageDescriptionMd)
        );
        newPage.pagePreviewHTML = dompurify.sanitize(
            marked.parse(newPage.pagePreviewMd)
        );
        newPage.createdBy = user.userId;
        let err = await addNewRow("pages", newPage);
        if (err instanceof ApiError) return reject(err);
        return resolve("page created");
    });
}

function updatePage(page, pageURL) {
    return new Promise(async (resolve, reject) => {
        helper.deleteEmptyFields(page);
        page.pageDescriptionHTML = dompurify.sanitize(
            marked.parse(page.pageDescriptionMd)
        );
        page.pagePreviewHTML = dompurify.sanitize(
            marked.parse(page.pagePreviewMd)
        );
        err = await updateRow("pages", page, {
            pageURL: pageURL,
        });
        if (err instanceof ApiError) return reject(err);
        return resolve("page item updated!");
    });
}

function deletePage(page) {
    return new Promise(async (resolve, reject) => {
        err = await deleteRow("pages", {
            pageURL: page.pageURL,
        });
        if (err instanceof ApiError) return reject(err);
        return resolve("item updated!");
    });
}

async function getPageByURL(pageURL) {
    return await getPage({ pageURL: pageURL });
}

async function getPage(jsonQueryObject) {
    let data = await getSpecificRows("pages", "*", jsonQueryObject);
    if (data instanceof ApiError) {
        return data;
    }
    return data[0];
}

async function getAllPages() {
    let data = await getAllRows("pages", "*");
    if (data instanceof ApiError) {
        return data;
    }
    return data;
}

async function createPageSlug(name) {
    var urlName = slugify(name, { lower: true, strict: true });
    let data = await getPageByURL(urlName);
    if (data == null) return urlName;
    var i = 0;
    newurlName = slugify(name + i, { lower: true, strict: true });
    while ((await getPageByURL(newurlName)) != null) {
        i++;
        console.info(await getPageByURL(newurlName));
        console.info(newurlName);
        newurlName = slugify(name + i, { lower: true, strict: true });
    }
    return newurlName;
}

module.exports = {
    emptyPage,
    newPage,
    updatePage,
    deletePage,
    getPageByURL,
    getAllPages,
};
