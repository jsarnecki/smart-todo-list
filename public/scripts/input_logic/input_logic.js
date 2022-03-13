
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



////////KEYWORDS DATABASE
const keywords = {
  //Have cases for plurals
  watch: ["movie", "creativework", "theatre", "cinema", "film", "tv", "television", "tvseason", "season", "premiered"],
  eat: ["restaurant", "organization", "corporation", "dish", "cuisine", "dine"],
  read: ["book", "novel", "fiction", "written", "author"],
  buy: ["product", "productmodel", "shop"]
};




  ////////////HELPER FUNCTIONS

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


    /*
      take in conjunction array to loop through
      each elm, check the category(elm), which returns array
      loop thru that array and countCategory(arr)
      and add these numbers to a master countObj
      return the obj, and a string stating each count for that original array + the original query
    */

const returnCountObject = function(array) {
  let masterCountObj = {
    watch: 0,
    eat: 0,
    read: 0,
    buy: 0
  };

  for (const elm of array) {
    let secondArray = checkCategory(elm);
    let countObj = countCategory(secondArray);
    for (count in countObj) {
     if (masterCountObj[count]) {//I think this is screwed up, make sure it's connecting to the object keys correctly
       masterCountObj[count]++;
     }
    }
  }

  console.log(`Total from masterCount: watch: ${masterCountObj.watch}, eat: ${masterCountObj.eat}, read: ${masterCountObj.read}, buy: ${masterCountObj.buy}`);
  return masterCountObj;
}



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

////////////////////NOTES ------- WORKFLOW ------- THINGS TO WORK ON


//TODO

//if type brings back Thing, with no other/minimal different types, do another api-call /
//or resend the query with some other search words
//Maybe have a counter for how many keywords they markoff, and then return the keyword with the most


//perhaps filter through a dictionary api, and only collect the words that are nouns
//or perhaps instead have a database full of the most common verbs go/see/watch/etc which filters through
  //the original query to see if they exist, and potentially redirect like "read"-> books "watch"->movies "eat"->food



    //if the types doesn't match something right away, break the description into an array, and run a similar test
    //check description first to see if it sets off any categories
    //filter out the conjunctions..?
    //Upon filtering conjunctions, if there are no obvious matches, potentially go thru and
      //filter everything out but the nouns of the description and run the search again on what is remaining??


    //If the type just comes back as 'Thing' we need to append something like "movie"/'book' to the original query to check if anything different comes up




/////////////////MAIN LOGIC


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
    //   //ADD FUNCTION HERE INSTEAD OF LOOP
    //   //Checking all the categories, we can add all the objects together to return one sum of the final counts for each
    //   //Create function to loop thru all the types
    // }

    const totalTypeCountObject = returnCountObject(types);
    console.log("total types count:", totalTypeCountObject);

    const dataObject = {
      name: newData.name,
      description: newData.description,
      description_body: newData.detailedDescription.articleBody
    }

    //Break the data.description_body, each word as elm into array
    let descriptionArr = dataObject.description_body;
    descriptionArr = descriptionArr.split(" ");
    // console.log("split:", descriptionArr);   //Here is the array from split
    let conjunctionFreeArr = removeConjunctions(descriptionArr);
    //Remove all the useless words from the description

    // for (let elm of conjunctionFreeArr) {
    //   //Loops through the conjunctionFree description to match against the keywords
    //   let conjuctTypeArr = checkCategory(elm);
    //   console.log("conjuctType:", conjuctTypeArr);
    //   //The categories are put into an array, and then counted to see which comes up the most
    //   let countObj = countCategory(conjuctTypeArr);
    //   console.log("countObj:", countObj);//Returns an object holding the counts for all the keywords

    // }
    const totalDescCountObject = returnCountObject(conjunctionFreeArr);
    console.log("from description:", totalDescCountObject);


    //console.log("conj.removed:", conjunctionFreeArr);

    //console.log(dataObject);
    return dataObject;
  })
  .catch(err => {
    console.log(err);
  });
}


getData();


/////////////DICTIONARY WORD API

// const getWordType = function(word) {
//   rp(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
//   .then(data => {
//     const result = JSON.parse(data);

//     console.log(result[0].meanings[0].partOfSpeech)
//     //result[0].meanings[THIS CAN BE MORE THAN 1, SO POTENTIALLY PUSH MULTIPLES INTO ARRAY AND COMPARE THE MAIN ONES]
//   })
// }

// getWordType('creative');



                                  ///---------------EXTRA---------------///
