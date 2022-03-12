// Client facing scripts here

const keywords = {
  watch: [],
  eat: ["Restaurant"],
  read: [],
  buy: []
};


const APIKEY = 'AIzaSyBJ-eqdhdex18EpEdsIFsb-QwoeEauolF0';

const checkCategory = (query) => {
    const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
    const  params = {
      'query': query,
      'limit': 5,
      'indent': true,
      key: APIKEY
    };

    $.getJSON(service_url + '?callback=?', params, function(response) {
      const data = response.itemListElement[0].result;
      const types = data["@type"];
      console.log(types);

      for (const category in keywords) {
        for (const keyword of keywords[category]) {
          if (types.includes(keyword)) {
            console.log(category);
            return category;
          }
        }
      }

      console.log("not found");
      return null;
    });
};


$(document).ready(function() {
  $("#create-task").submit(function(event) {
    const query = $("#user-input").val();
    checkCategory(query)
  });
})
