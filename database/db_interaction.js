const ApiError = require("../error/data-errors");
const data = require("../controllers/data");
const { search } = require("../routes");
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

async function searchInColumns(table, selectValues, filter, n = 10) {
    let prepareStm = prepareWhereLikeStmt(filter);
    let sql = `SELECT ${selectValues} FROM ${table} WHERE (${prepareStm[0]}) LIMIT ${n} `;
    return await db_generic
        .dbQuery(sql, prepareStm[1])
        .then((result) => {
            return result;
        })
        .catch((err) => {
            return err;
        });
}

function prepareWhereLikeStmt(filter) {
    values = [];
    sql = "";
    for (let column in filter) {
        values.push(filter[column]);
        sql += ` ${column} LIKE ? OR`;
    }
    sql = sql.slice(0, sql.length - 3);
    return [sql, values];
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
