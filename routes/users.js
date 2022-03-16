/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
const bcrypt = require('bcryptjs');
const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const query = `SELECT id, username, password FROM users WHERE email = $1;`;
    const params = [email];

    db.query(query, params)
      .then(data => {
        console.log(data.rows);
        if (!data.rows.length) {
          return res.status(400).send('Error: Invalid user login');
        }
        if (data.rows[0].id <= 3 && data.rows[0].password !== password) {
          //Checks nonhashed passwords of built in users
          return res.status(400).send('Error: Invalid user password');
        }
        if (data.rows[0].id > 3 && !bcrypt.compareSync(password, data.rows[0].password)) {
          //Above id# 3 as they are the built in users without a hashed password
          return res.status(400).send('Error: Invalid password');
        }
        req.session.user_id = data.rows[0].id;
        req.session.username = data.rows[0].username;
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
  });

  router.post("/register", (req, res) => {
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    const newUsername = req.body.username;

    if (!newEmail || !newPassword || !newUsername) {
      return res.status(400).send('404 Error: Must fill in all inputs');
    }

    //bcrytp...
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const query = `SELECT * FROM users;`

    //psql query to grab all users, test against new email/username
    db.query(query)
      .then(data => {

        const userData = data.rows;
        for (const user of userData) {
          //Test against db to make sure the email/username is not in use
          if (user.email === newEmail) {
            res.status(400).send('404 Error: Email already in use');
            return;
          }
          if (user.username === newUsername) {
            return res.status(400).send('404 Error: Username already in use');
          }
        };

        const query2 = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username;`;
        const params2 = [newUsername, newEmail, hashedPassword];
        //When hashed password is all good, add the new user to the db

            db.query(query2, params2)
            .then(data => {
              const newUser = data.rows[0];
              //set cookies
              req.session.user_id = newUser.id;
              req.session.username = newUser.username;
              res.redirect("/");
            })
            .catch(err => {
              res
                .status(500)
                .json({ error: err.message });
            });

      })

    console.log(newEmail, newPassword, newUsername);

  });

  return router;
};
