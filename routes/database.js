const express = require("express");
const {
    createUsersTable,
    createCommitteesTable,
    createPagesTable,
    createActivitiesTable,
    createFinancesTable,
} = require("../database/db_generate_tables");
const db = require("../database/db_generic");
const router = express.Router();

router.get("/createTables", async (req, res, next) => {
    await createUsersTable(req, res, next);
    await createCommitteesTable(req, res, next);
    await createActivitiesTable(req, res, next);
    await createPagesTable(req, res, next);
    await createFinancesTable(req, res, next);
    res.send("all tables created");
});

router.get("/createUsersTable", async (req, res, next) => {
    await createUsersTable(req, res, next);
    res.send("table created!");
});

router.get("/createCommitteeTable", async (req, res, next) => {
    await createCommitteesTable(req, res, next);
    res.send("table created!");
});

router.get("/createActivitiesTable", async (req, res, next) => {
    await createActivitiesTable(req, res, next);
    res.send("table created!");
});

router.get("/createPagesTable", async (req, res, next) => {
    await createPagesTable(req, res, next);
    res.send("table created!");
});

router.get("/createFinancesTable", async (req, res, next) => {
    await createFinancesTable(req, res, next);
    res.send("table created!");
});

router.get("/dropTable/:table", (req, res, next) => {
    console.log(req.params.table);
    let sql = `DROP TABLE ${req.params.table}`;
    db.dbGetRows(sql);
    res.send(`table ${req.params.table} dropped`);
});

module.exports = router;
