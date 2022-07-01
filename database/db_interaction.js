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
    prepareStmt = getPrepareStmt(filter);
    let sql = `UPDATE ${table} SET ? WHERE ${prepareStmt[0]}`;
    return db_generic.dbQuery(sql, [setValues, prepareStmt[1]]).catch((err) => {
        return err;
    });
}

async function updateRowNull(table, setValues, nullColumn, filter) {
    prepareStmt = getPrepareStmt(filter);
    let sql = `UPDATE ${table} SET ? WHERE ${nullColumn} IS NULL AND ${prepareStmt[0]}`;
    return db_generic.dbQuery(sql, [setValues, prepareStmt[1]]).catch((err) => {
        return err;
    });
}

async function deleteRow(table, filter) {
    prepareStmt = getPrepareStmt(filter);
    let sql = `DELETE FROM ${table} WHERE ${prepareStmt[0]}`;
    return db_generic.dbQuery(sql, prepareStmt[1]).catch((err) => {
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
    prepareStmt = getPrepareStmt(filter);
    let sql = `SELECT ${selectValues} FROM ${table} WHERE ${prepareStmt[0]} `;
    return await db_generic
        .dbQuery(sql, prepareStmt[1])
        .then((result) => {
            return result;
        })
        .catch((err) => {
            return ApiError.internal("could not handle this query");
        });
}

function getPrepareStmt(filter) {
    values = [];
    sql = "";
    for (let column in filter) {
        values.push(filter[column]);
        sql += ` ${column} = ? AND`;
    }
    sql = sql.slice(0, sql.length - 4);
    return [sql, values];
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
    updateRowNull,
    addNewRow,
    deleteRow,
    getSpecificRows,
    getAllRows,
    getDataFromMultipleTables,
};
