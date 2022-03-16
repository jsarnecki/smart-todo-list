// database.js
// helper functions for db manipulations

const request = require("request-promise");
const APIKEY = 'AIzaSyBJ-eqdhdex18EpEdsIFsb-QwoeEauolF0';

const keywords = {
  watch: ["watch", "movie", "creativework", "theatre", "cinema", "film", "tv", "television", "tvseason", "tvseries", "season", "premiered"],
  eat: ["eat", "event", "place", "food", "restaurant", "organization", "corporation", "dish", "cuisine", "dine", "snack", "appetizer", "recipe", "stadiumorarena"],
  read: ["read", "book", "novel", "fiction", "written", "author"],
  buy: ["buy", "productmodel", "shop", "organization", "corporation"] //thing?
  //"organization", "corporation" - could trip off both eat and buy
};
//"Nouns that relate to... (and add these as more keywords)"
      //***Need a condition to match against plurals of the keywords

const removePunctuation = function(str) {
  //Makes the string lowercase as well as remove anything not a number/letter
  let newStr = str.replace(/[^\w\s]|_/g, "")
  .replace(/\s+/g, " ")
  .toLowerCase();
  return newStr;
}

const removeConjunctions = function(arr) {
  const conjunctions = ["the", "a", "an", "and", "or", "that", "as", "than", "so", "since", "is", "of", "are", "in", "be", "also", "by", "him", "her"];
  const freshArr = [];
  for (const elm of arr) {
    if (!conjunctions.includes(elm.toLowerCase())) {
      freshArr.push(elm);
    }
  }
  return freshArr;
}

const categoryFunction = function(type) {
  console.log("checking category for:", type);
  let resultArr = [];
  for (const category in keywords) {
    for (const keyword of keywords[category]) {
      //remove punctuation when comparing---
      if (keyword.includes(removePunctuation(type)) && type !== "" && type.length > 1) {
        console.log(`${type} has matched with ${category}`);;
        resultArr.push(category);
      }
    }
  }

  if (!resultArr.length) {
    return resultArr;
  }
  if (Array.isArray(resultArr) && resultArr.length !== 0) {
    for (const elm of resultArr) {
      console.log(`${type} has this matching type: ${elm}`)
    }
  }
  return resultArr;
}

const returnCountObject = function(array, obj) {
  // Takes in types array, as well as the conjunctionFreeDesc array along with masterCountObj

  for (const elm of array) {
    //Each element is tested against the categories, returns an array of categories
    let matchedKeywords = categoryFunction(elm);
    console.log("matchedKeywords:", matchedKeywords);
    for (const cat of matchedKeywords) {
      if (cat === 'watch') {
        obj.watch++;
      }
      if (cat === 'eat') {
        obj.eat++;
      }
      if (cat === 'read') {
        obj.read++;
      }
      if (cat === 'buy') {
        obj.buy++;
      }
    }
  }
  console.log(`Total from masterCount: watch: ${obj.watch}, eat: ${obj.eat}, read: ${obj.read}, buy: ${obj.buy}`);
  return obj;
}

const returnHighestVal = function(obj) {
  const valArr = Object.values(obj);
  const keyArr = Object.keys(obj);

  let maxVal = valArr[0];
  let maxIndex = 0;

  for (let elm of valArr) {
    if (elm >= maxVal) {
      maxVal = elm;
      maxIndex = valArr.indexOf(elm);
    }
  }
  //****If two values have the same amount?
  if (maxVal === 0) {
    console.log("no values checked")
    return 'none';
  }
  return keyArr[maxIndex];
}

const checkCategory = (value) => {

  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${value.replace(" ", "+")}&limit=1&indent=true&key=${APIKEY}&_=1647056117597`

  return request(url)
    .then((res) => {

      console.log("original data before parse:", res);
      const data = JSON.parse(res).itemListElement;
      console.log("original data (.itemListElement):", data);

      // if (data[0] === undefined) {
      //   //redo search with city
      //   return 'none';
      //   //But maybe look into figuring out different logic or a different API, different method if we have time
      // }

      for (let elm of data[0].result['@type']) {
        console.log("here is an elm of types:", elm);
      }

      //add count object
      const masterCountObj = {
        watch: 0,
        eat: 0,
        read: 0,
        buy: 0
      };

      const description = data[0].result.description;
      const descriptionBody = data[0].result.detailedDescription.articleBody
      const types = data[0].result["@type"];

      /////------#1 CHECK TYPES------///////
      console.log("types:", types);
      if (types) {
        //check types, if there's match, return the match
        const typesCategoryObj = returnCountObject(types, masterCountObj);
        const highestCategory = returnHighestVal(typesCategoryObj);
        if (highestCategory !== 'none') {
          return highestCategory;
        }
      }

      //////--------#2 CHECK DESCRIPTION --------/////
      console.log("description", description);
      if (description) {
        //check if description exist, try matching - return match if exists
        let descriptionArr = description.split(" ");
        descriptionArr = removeConjunctions(descriptionArr);
        const descriptionCategoryObj = returnCountObject(descriptionArr, masterCountObj);
        const highestDescCategory = returnHighestVal(descriptionCategoryObj);
        if (highestDescCategory !== 'none') {
          console.log("highest val from descripton check:", highestDescCategory);
          return highestDescCategory;
        }
      }

      ///////--------#3 CHECK DESCRIPTION BODY---------//////
      console.log("descriptionBody", descriptionBody);
      if (descriptionBody) {
         //check if descriptionBody exist, try matching - return match if exists
        let descriptionBodyArr = descriptionBody.split(" ");
        descriptionBodyArr = removeConjunctions(descriptionBodyArr);
        const descriptionBodyObj = returnCountObject(descriptionBodyArr, masterCountObj);
        const highestDescBodyCategory = returnHighestVal(descriptionBodyObj);
        if (highestDescBodyCategory !== 'none') {
          console.log("highest val from descriptonBody check:", highestDescBodyCategory);
          return highestDescBodyCategory;
        }
      }

      //***RERUN API WITH CITY NAME BEFORE RETURNING NONE

      console.log("Gone thru all tests, before returning NONE here is countObj:", masterCountObj);
      if (types.includes("Thing")) {
        //If no tests pass, checks for 'thing' inside types, and returns buy if true
        //***Though this sometimes gives weird results so maybe refactor
        return 'buy';
      }
      return 'none';
    })
};



const addTask = (db, user_id, value, category) => {
  const queryString = `
  INSERT INTO tasks (user_id, description, category, date_completed, is_complete)
  VALUES ($1, $2, $3, $4, $5);
  `;

 const values = [user_id, value, category, null, 0];

   return db.query(queryString, values)
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
  completeTask,
  checkCategory
};
