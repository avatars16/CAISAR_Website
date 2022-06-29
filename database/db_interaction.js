const data = require("../models/data");
const db_generic = require("./db_generic");

async function addNewRow(table, setValues) {
    let sql = `INSERT INTO ${table} SET ?`;
    return db_generic.dbQuery(sql, setValues).catch((err) => {
        return err;
    });
}

async function updateRow(table, setValues, filter) {
    let sql = `UPDATE ${table} SET ? WHERE ?`;
    return db_generic.dbQuery(sql, [setValues, filter]).catch((err) => {
        return err;
    });
}

async function deleteRow(table, filter) {
    let sql = `DELETE FROM ${table} WHERE ?`;
    return db_generic.dbQuery(sql, filter).catch((err) => {
        return err;
    });
}

async function getRow(table, selectValues, filter) {
    let sql = `SELECT ${selectValues} FROM ${table} WHERE ? `;
    return await db_generic
        .dbQuery(sql, filter)
        .then((result) => {
            return result;
        })
        .catch((err) => {});
}

function createSearchQuery(filters) {
    formattedFilters = "";
    for (const property in filters) {
        formattedFilters += property + '="' + filters[property] + '" AND ';
    }
    formattedFilters = formattedFilters.slice(0, formattedFilters.length - 5);
    return formattedFilters;
}

module.exports = {
    createSearchQuery,
    updateRow,
    addNewRow,
    deleteRow,
    getRow,
};
