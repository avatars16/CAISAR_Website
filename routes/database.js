const express = require("express");
const {
    createUserTable,
    createCommitteeTable,
    createCalenderTable,
} = require("../database/db_generate_tables");
const db = require("../database/db_generic");
const router = express.Router();

router.get("/createUserTable", (req, res) => {
    createUserTable(req, res);
});

router.get("/createCommitteeTable", (req, res) => {
    createCommitteeTable(req, res);
});

router.get("/createCalendarTable", (req, res) => {
    createCalenderTable(req, res);
});

router.get("/dropTable/:table", (req, res) => {
    console.log(req.params.table);
    let sql = `DROP TABLE ${req.params.table}`;
    db.dbGetRows(sql);
    res.send(`table ${req.params.table} dropped`);
});

module.exports = router;
