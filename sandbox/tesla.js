'use strict';

var request = require("request");


var getStockPrice = function (url, callback) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonpData = body;
      var json;
      //if you don't know for sure that you are getting jsonp, then i'd do something like this
      try
      {
        json = JSON.parse(jsonpData);
      }
      catch(e)
      {
          var startPos = jsonpData.indexOf('({');
          var endPos = jsonpData.indexOf('})');
          var jsonString = jsonpData.substring(startPos+1, endPos+1);
          json = JSON.parse(jsonString);
        }
        callback(null, json);
      } else {
        callback(error);
      }
    })
}



var stockPriceApi = 'http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=TSLA&callback=getQuote';

function returnPrice(err, data) {
  if (err) {
    console.log(err);
  } else {
    var price = '$' + data.LastPrice;
    console.log(price);
    return price
  }
}

getStockPrice (stockPriceApi, returnPrice);




//
// var getWeather = function(location, callback) {
//   request.get({
//     url: "http://api.openweathermap.org/data/2.5/weather",
//     qs: {
//       q: location,
//       APPID: "6460241df9136925432064ac70416d05"
//     },
//     json: true
//   }, function(error, response) {
//     if (response.statusCode !== 200) {
//       callback.call(this, response.body);
//     } else {
//       callback.call(this, null, response.body);
//     }
//   });
// };
//
// getWeather('Toronto', function(err,data) {
//   console.log(data.weather[0].description)
// })
