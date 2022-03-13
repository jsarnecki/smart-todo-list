/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const { addTask, deleteTask, recategorizeTask } = require("../database");

module.exports = (db) => {
  router.get("/", (req, res) => {
    let query = `SELECT * FROM tasks`;
    console.log(query);
    db.query(query)
      .then(data => {
        const tasks = data.rows;
        res.json({ tasks });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/new", (req, res) => {
    addTask(db, 1, req.body.text);
    res.redirect("/");
  });

  router.post("/delete/:id", (req, res) => {
    const task_id = req.params.id;
    deleteTask(db, task_id);
    res.redirect("/");
  });

  router.post("/update/:id", (req, res) => {
    const task_id = req.params.id;
    recategorizeTask(db, task_id);
    res.redirect("/");
  });

  return router;
};
