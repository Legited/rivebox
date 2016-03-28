var request = require("request");

function getTeslaStockPrice(callback) {
  var getJsonFromJsonP = function (url, callback) {
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
  var api = 'http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=TSLA&callback=getQuote';
  getJsonFromJsonP(api, function (err, data) {
      var price = '$' + data.LastPrice;
      //console.log(price);
      return price;
  });
};

console.log(getTeslaStockPrice())
