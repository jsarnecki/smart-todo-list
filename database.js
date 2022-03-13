// database.js
// helper functions for db manipulations

const request = require("request-promise");
const APIKEY = 'AIzaSyBJ-eqdhdex18EpEdsIFsb-QwoeEauolF0';

const checkCategory = (query) => {
  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${query.replace(" ", "+")}&limit=1&indent=true&key=${APIKEY}&_=1647056117597`
  const keywords = {
    watch: ["Movie", "MovieSeries", "TVEpisode", "TVSeries"],
    eat: ["Restaurant"],
    read: ["BookSeries", "Book"],
    buy: ["Product"]
  };

  return request(url)
    .then((res) => {
      const data = JSON.parse(res).itemListElement[0].result;
      const types = data["@type"];
      console.log(types);

      for (const category in keywords) {
        for (const keyword of keywords[category]) {
          if (types.includes(keyword)) {
            return category;
          }
        }
      }

      return 'none';
    })
};

const addTask = (db, user_id, query) => {
  const queryString = `
  INSERT INTO tasks (user_id, description, category, date_completed, is_complete)
  VALUES ($1, $2, $3, $4, $5);
  `;

  return checkCategory(query)
    .then((category) => {
      const values = [user_id, query, category, new Date(), false];

      db.query(queryString, values)
        .then((res) => {
          if (res.rows) {
            return Promise.resolve(res.rows);
          } else {
            return null;
          }
        })
        .catch(err => {
          console.log(err);
        });
    });
};

const deleteTask = (db, task_id) => {
  const queryString = `DELETE FROM tasks WHERE id = $1;`;
  return db.query(queryString, [task_id])
    .then((res) => {
      if (res.rows) {
        return Promise.resolve(res.rows);
      } else {
        return null;
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const recategorizeTask = (db, task_id) => {
  const categories = ["eat", "watch", "read", "buy", "none"]
  let queryString = `SELECT category FROM tasks WHERE id = $1;`

  db.query(queryString, [task_id])
    .then((res) => {
      const category = res.rows[0].category;
      let index = categories.indexOf(category);
      index + 1 > 4 ? index = 0 : index++;

      queryString = `
      UPDATE tasks
      SET category = $1
      WHERE id = $2;
      `;

      return db.query(queryString, [categories[index], task_id])
        .then((res) => {
          if (res.rows) {
            return Promise.resolve(res.rows);
          } else {
            return null;
          }
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

const completeTask = (db, task_id) => {
  let queryString = `SELECT is_complete FROM tasks WHERE id = $1;`

  db.query(queryString, [task_id])
    .then((res) => {
      let is_complete = res.rows[0].is_complete;
      let date;

      if (is_complete) {
        is_complete = 0;
        date = null;
      } else {
        is_complete = 1;
        date = new Date;
      }

      queryString = `
      UPDATE tasks
      SET is_complete = $1, date_completed = $2
      WHERE id = $3;
      `;

      return db.query(queryString, [is_complete, date, task_id])
        .then((res) => {
          if (res.rows) {
            return Promise.resolve(res.rows);
          } else {
            return null;
          }
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  addTask,
  deleteTask,
  recategorizeTask,
  completeTask
};
