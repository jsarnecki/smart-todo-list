/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

/*
id: 1,
username: "katstratford",
email: "katstratford@email.com",
password: "1234"
*/

module.exports = (db) => {
  router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const query = `SELECT id FROM users WHERE email = $1 AND password = $2;`;
    const params = [email, password];

    db.query(query, params)
      .then(data => {
        console.log(data.rows);
        if (!data.rows.length) {
          res.status(400).send('Error: Invalid user login');
          return;
        }
        req.session.user_id = data.rows[0].id;
        res.redirect("/");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  })

  return router;
};
