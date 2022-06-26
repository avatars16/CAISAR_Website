const db_generic = require("./db_generic");

function createSearchQuery(filters) {
    formattedFilters = "";
    for (const property in filters) {
        formattedFilters += property + '="' + filters[property] + '" AND ';
    }
    formattedFilters = formattedFilters.slice(0, formattedFilters.length - 5);
    return formattedFilters;
}

async function insertNewRow(table, rowObject) {
    let sql = `INSERT INTO ${table} SET ?`;
    data = db_generic.dbQuery(sql, rowObject);
    if (Object.keys(data).length === 0) {
        return true;
    }
    return false;
}

module.exports = { insertNewRow, createSearchQuery };
