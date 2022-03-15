/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
const bcrypt = require('bcryptjs');
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
    const query = `SELECT id, username FROM users WHERE email = $1 AND password = $2;`;
    const params = [email, password];

    db.query(query, params)
      .then(data => {
        console.log(data.rows);
        if (!data.rows.length) {
          res.status(400).send('Error: Invalid user login');
          return;
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
        //console.log(userData, Array.isArray(userData));
        //Test against db to make sure the email/username is not in use
        for (const user of userData) {
          //console.log(user.email, user.email === newEmail);
          if (user.email === newEmail) {
            res.status(400).send('404 Error: Email already in use');
            return;
          }
          if (user.username === newUsername) {
            return res.status(400).send('404 Error: Username already in use');
          }
        }

        const query2 = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3);`;
        const params2 = [newUsername, newEmail, hashedPassword];
        //When hashed password is all good, add the new user to the db
        db.query(query2, params2)
          .then(data => {
            const users = data.rows;
            res.json({ users });
          })
          .catch(err => {
            res
              .status(500)
              .json({ error: err.message });
          });

        //set the cookie with the new id
        //res.redirect("/");
      })


    console.log(newEmail, newPassword, newUsername);

  });

  return router;
};
