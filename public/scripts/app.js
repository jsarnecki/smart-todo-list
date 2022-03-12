// Client facing scripts here

const { Pool } = require("pg");
const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'midterm'
});

const keywords = {
  watch: [],
  eat: ["Restaurant"],
  read: [],
  buy: []
};

const APIKEY = 'AIzaSyBJ-eqdhdex18EpEdsIFsb-QwoeEauolF0';

const fetchKnowledgeGraph = (query) => {
  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${query}&limit=1&indent=true&key=${APIKEY}&_=1647056117597`
  return $.get(url);
};

const checkCategory = (query) => {
  return fetchKnowledgeGraph(query)
    .then((res) => {
      const data = res.itemListElement[0].result;
      const types = data["@type"];

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


$(document).ready(function() {
  $("#create-task").submit(function(event) {
    const query = $("#user-input").val();

    checkCategory(query)
    .then((category) => {
      const queryString = `
      INSERT INTO tasks (user_id, description, category, date_created, is_complete)
      VALUES ($1, $2, $3, $4, $5);
      `;
      const values = [1, query, category, new Date(), false];

      pool.query(queryString, values);
    })
  });
})
