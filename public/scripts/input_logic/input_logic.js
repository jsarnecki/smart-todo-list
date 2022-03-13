
const rp = require('request-promise-native');
const APIKEY = require('constants')
//const request = require('request');

let cmdInput = process.argv.slice(2);

const stringQueryTogether = function(arr) {
  if (arr.length > 1) {
    return arr.join("+");
  }
  return arr[0];
}

const query = stringQueryTogether(cmdInput);
console.log("input:", query);


//Potentially add to promise chain if there are more api calls
// const checkData = function(data) { //2nd promise?
//     const result = JSON.parse(data);
//     const type = result.itemListElement[0].result['@type'];
//     console.log("type", type);
//     const newData = result.itemListElement[0].result;
//     const dataObject = {
//       name: newData.name,
//       description: newData.description,
//       description_body: newData.detailedDescription.articleBody
//     }
//     console.log(dataObject);
//     return dataObject;
//   }



const keywords = {
  //Have cases for plurals
  watch: ["movie", "creativework", "theatre", "cinema", "film", "tv", "television", "tvseason", "season", "premiered"],
  eat: ["restaurant", "organization", "corporation", "dish", "cuisine", "dine"],
  read: ["book", "novel", "fiction", "written", "author"],
  buy: ["product", "productmodel", "shop"]
};

//if description includes 'film' / 'book/novel'

//TODO
//have the cmdInput string multiple words together with +


//if type brings back Thing, with no other/minimal different types, do another apicall /
//or resend the query with some other search words
//Maybe have a counter for how many keywords they markoff, and then return the keyword with the most



//perhaps filter through a dictionary api, and only collect the words that are nouns
//or perhaps instead have a database full of the most common verbs go/see/watch/etc which filters through
  //the original query to see if they exist, and potentially redirect like "read"-> books "watch"->movies "eat"->food

const checkCategory = function(type) {
  let resultArr = ["type:", type];
  for (const category in keywords) {
    for (const keyword of keywords[category]) {
      if (type.toLowerCase().includes(keyword)) {
       // console.log(category);
        resultArr.push(category);
      }
    }
    //console.log(resultArr);
    //return resultArr;
  }

  if (!resultArr.length) {
    console.log(`Couldn't find matching types for ${type}`);
    return;
  }
  if (Array.isArray(resultArr)) {
    for (const elm of resultArr) {
      console.log(`${type} has this matching type: ${elm}`)
    }
  }
  //console.log(`${query} has these matching types: ${resultArr}`);
  return resultArr;
}

const countCategory = function(categoryArr) {
  let counter = {
    watch: 0,
    eat: 0,
    read: 0,
    buy: 0
  }

  for (const cat of categoryArr) {
    if (cat === 'watch') {
      counter.watch++;
    }
    if (cat === 'eat') {
      counter.eat++;
    }
    if (cat === 'read') {
      counter.read++;
    }
    if (cat === 'buy') {
      counter.buy++;
    }
  }

  return counter;
}

// const getWordType = function(word) {
//   rp(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
//   .then(data => {
//     const result = JSON.parse(data);

//     console.log(result[0].meanings[0].partOfSpeech)
//     //result[0].meanings[THIS CAN BE MORE THAN 1, SO POTENTIALLY PUSH MULTIPLES INTO ARRAY AND COMPARE THE MAIN ONES]
//   })
// }

// getWordType('creative');

const conjunctions = ["the", "a", "an", "and", "or", "that", "as", "than", "so", "since", "is", "of", "are", "in"];

const removeConjunctions = function(arr) {
  const freshArr = [];
  for (const elm of arr) {
    if (!conjunctions.includes(elm.toLowerCase())) {
      freshArr.push(elm);
    }
  }
  return freshArr;
}



const getData = function() {
  rp(`https://kgsearch.googleapis.com/v1/entities:search?query=${query}&key=${APIKEY}&limit=1&indent=True`)
  .then(data => {
    const result = JSON.parse(data);

    if (result.itemListElement[0] === undefined) {
      //Checks if itemListElm comes back undefined
      //if this happens, maybe run a different API on the query searched?
      console.log("itemListElement[0] is not defined");
      console.log(result);
      return;
    }

    const types = result.itemListElement[0].result['@type'];
    console.log("type", types);
    const newData = result.itemListElement[0].result;

    // for (let elm of types) {
    //   checkCategory(elm);
    // }

    const dataObject = {
      name: newData.name,
      description: newData.description,
      description_body: newData.detailedDescription.articleBody
    }

    //if the types doesn't match something right away, break the description into an array, and run a similar test
    //check description first to see if it sets off any categories
    //filter out the conjunctions..?
    //Upon filtering conjunctions, if there are no obvious matches, potentially go thru and
      //filter everything out but the nouns of the description and run the search again on what is remaining??

    let descriptionArr = dataObject.description_body;
    descriptionArr = descriptionArr.split(" ");
    console.log("split:", descriptionArr);
    let conjunctionFreeArr = removeConjunctions(descriptionArr);
    for (let elm of conjunctionFreeArr) {
      let conjuctTypeArr = checkCategory(elm);
      console.log("conjuctType:", conjuctTypeArr);
      let countObj = countCategory(conjuctTypeArr);
      console.log("countObj:", countObj);
    }
    console.log("conj.removed:", conjunctionFreeArr);

    //console.log(dataObject);
    return dataObject;
  })
  .catch(err => {
    console.log(err);
  });
}


//If the type just comes back as 'Thing' we need to append something like "movie"/'book' to the original query to check if anything different comes up


getData();



                                  ///---------------EXTRA---------------///
// const checkCategory = (query) => {
//     const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
//     const  params = {
//       'query': query,
//       'limit': 5,
//       'indent': true,
//       key: APIKEY
//     };

//     $.getJSON(service_url + '?callback=?', params, function(response) {
//       const data = response.itemListElement[0].result;
//       const types = data["@type"];
//       console.log(types);

//       for (const category in keywords) {
//         for (const keyword of keywords[category]) {
//           if (types.includes(keyword)) {
//             console.log(category);
//             return category;
//           }
//         }
//       }

//       console.log("not found");
//       return null;
//     });
// };
// $(document).ready(function() {
//   $("#create-task").submit(function(event) {
//     const query = $("#user-input").val();
//     checkCategory(query)
//   });
// })
