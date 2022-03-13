
const rp = require('request-promise-native');
const APIKEY = 'AIzaSyBJ-eqdhdex18EpEdsIFsb-QwoeEauolF0';
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
  watch: ["movie", "creativework"],
  eat: ["restaurant", "organization", "corporation", "dish", "cuisine"],
  read: ["book", "novel"],
  buy: ["product", "productmodel"]
};

//if description includes 'film' / 'book/novel'

//TODO
//have the cmdInput string multiple words together with +
//After the search, have the 

//if type brings back Thing, with no other/minimal different types, do another apicall / 
//or resend the query with some other search words
//perhaps filter through a dictionary api, and only collect the words that are nouns
//or perhaps instead have a database full of the most common verbs go/see/watch/etc which filters through
  //the original query to see if they exist, and potentially redirect like "read"-> books "watch"->movies "eat"->food

const checkCategory = function(type) {
  let resultArr = [];
  for (const category in keywords) {
    for (const keyword of keywords[category]) {
      if (type.toLowerCase().includes(keyword)) {
       // console.log(category);
        resultArr.push(category);
      }
    }
  }
  if (!resultArr.length) {
    console.log(`Couldn't find matching types for ${type}`);
   // return;
  }
  console.log(`${query} has these matching types: ${resultArr}`);
  //return resultArr;
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

    for (let elm of types) {
      checkCategory(elm);
    }

    const dataObject = {
      name: newData.name,
      description: newData.description,
      description_body: newData.detailedDescription.articleBody
    }

    console.log(dataObject);
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
