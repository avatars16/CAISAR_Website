const express = require("express");
const createUserTable = require("../models/db_generate_tables");
const db = require("../models/db_generic");
const router = express.Router();

router.get("/createUserTable", (req, res) => {
    createUserTable(req, res);
});

router.get("/dropTable/:table", (req, res) => {
    console.log(req.params.table);
    let sql = `DROP TABLE ${req.params.table}`;
    db.dbGetRows(sql);
    res.send(`table ${req.params.table} dropped`);
});

router.get("/createTable", (req, res) => {
    let sql =
        "CREATE TABLE users(id int AUTO_INCREMENT, date DATETIME,name VARCHAR(255), email VARCHAR(255), password text, PRIMARY KEY (id))";
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send("posts table created");
    });
});

router.get("/create", (req, res) => {
    let sql = "CREATE DATABASE caisar";
    db.query(sql, (error, result) => {
        if (error) throw error;
        res.send("database created");
    });
});

router.get("/addPost", (req, res) => {
    //Check for SQL injection
    let posts = { title: "post 10", body: "this is post number one" };
    let sql = "INSERT INTO posts SET ?";
    let query = db.query(sql, posts, (err, result) => {
        if (err) throw err;
        res.send("post 1 added");
    });
});

router.get("/selectPosts", (req, res) => {
    let sql = "SELECT * FROM posts";
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        console.log(results);
        res.send("post 1 added");
    });
});

router.get("/selectPost/:id", (req, res) => {
    let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send("post 1 added");
    });
});

router.get("/updatePost/:id", (req, res) => {
    let newTitle = "Updated title";
    let sql = `UPDATE posts SET title = '${newTitle}' WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send("post updated");
    });
});

router.get("/deletePost/:id", (req, res) => {
    let newTitle = "Updated title";
    let sql = `DELETE FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send("post updated");
    });
});

module.exports = router;
