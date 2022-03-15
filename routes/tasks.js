/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const { addTask, deleteTask, recategorizeTask, completeTask } = require("../database");

module.exports = (db) => {
  router.get("/", (req, res) => {
    let query = `SELECT * FROM tasks ORDER BY id;`;
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
    deleteTask(db, req.params.id);
    res.redirect("/");
  });

  router.post("/update/category/:id", (req, res) => {
    recategorizeTask(db, req.params.id);
    res.redirect("/");
  });

  router.post("/update/complete/:id", (req, res) => {
    completeTask(db, req.params.id);
    res.redirect("/");
  });

  return router;
};
