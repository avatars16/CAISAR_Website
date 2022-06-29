const ApiError = require("../error/data-errors");
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

async function getAllRows(table, selectValues) {
    let sql = `SELECT ${selectValues} FROM ${table}`;
    return await db_generic
        .dbSimpleQuery(sql)
        .then((result) => {
            return result;
        })
        .catch((err) => {
            return ApiError.internal("could not handle this query");
        });
}

async function getSpecificRows(table, selectValues, filter) {
    let sql = `SELECT ${selectValues} FROM ${table} WHERE ? `;
    return await db_generic
        .dbQuery(sql, filter)
        .then((result) => {
            return result;
        })
        .catch((err) => {
            return ApiError.internal("could not handle this query");
        });
}

async function getDataFromMultipleTables(
    table1,
    table2,
    columnid1,
    columnid2,
    filter
) {
    let sql = `SELECT * 
    FROM ${table1}
    INNER JOIN ${table2}
    ON ${table1}.${columnid1} = ${table2}.${columnid2}
    WHERE ?`;
    return await db_generic
        .dbQuery(sql, filter)
        .then((result) => {
            return result;
        })
        .catch((err) => {
            return ApiError.internal("could not handle this query");
        });
}

//This function does not work,
//It allways returns an empty database.
async function searchInColumns(table, selectValues, searchItem, searchColumns) {
    let sql = `SELECT ${selectValues} FROM ${table} WHERE ? LIKE ?  `;
    return await db_generic
        .dbQuery(sql, [searchColumns, searchItem])
        .then((result) => {
            return result;
        })
        .catch((err) => {
            return ApiError.internal("could not handle this query");
        });
}

module.exports = {
    searchInColumns,
    updateRow,
    addNewRow,
    deleteRow,
    getSpecificRows,
    getAllRows,
    getDataFromMultipleTables,
};
