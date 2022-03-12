const express = require('express');
const taskRoutes = express.Router();

module.exports = function() {

  taskRoutes.post("/", function(req, res) {
    console.log(req.body)
    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }
    res.redirect("/")
  })
  return taskRoutes;
}
