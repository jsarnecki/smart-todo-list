/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const { addTask, deleteTask, recategorizeTask, completeTask, checkCategory } = require("../database");

module.exports = (db) => {
  router.get("/", (req, res) => {
    const user_id = req.session.user_id;
    const order = req.session.listOrder;
    let query = "SELECT * FROM tasks WHERE user_id = $1 ";
    const values = [user_id];

    if (order === "time") {
      query += "ORDER BY id;"
    } else {
      query += "and category = $2 ORDER BY id;";
      values.push(order);
    }

    db.query(query, values)
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

  router.post("/sort-list", (req, res) => {
    const category = req.session.listOrder;
    const categories = ["eat", "watch", "read", "buy", "none", "time"];

    let index = categories.indexOf(category);
    index + 1 > 5 ? index = 0 : index++;

    req.session.listOrder = categories[index];
    res.send(categories[index]);
  });

  router.post("/new", (req, res) => {
    const user_id = req.session.user_id;
    const description = req.body.text;

    if (!description) {
      return res.status(403).send('404 Error: Input required');
    }

    checkCategory(description)
      .then((category) => {
        addTask(db, user_id, description, category)
        .then(() => {
          res.redirect("/");
        })
      })
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
