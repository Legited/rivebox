// Asynchronous Objects Example
// See the accompanying README.md for details.

// Run this demo: `node weatherman.js`

var readline = require("readline");
var request = require("request");
var colors = require('colors');

// This would just be require("rivescript") if not for running this
// example from within the RiveScript project.
var RiveScript = require("../lib/rivescript");
var rs = new RiveScript();

var getWeather = function(location, callback) {
  request.get({
    url: "http://api.openweathermap.org/data/2.5/weather",
    qs: {
      q: location,
      APPID: "6460241df9136925432064ac70416d05"
    },
    json: true
  }, function(error, response) {
    if (response.statusCode !== 200) {
      callback.call(this, response.body);
    } else {
      callback.call(this, null, response.body);
    }
  });
};

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
        callback.call(this, null, json);
      } else {
        callback.call(this, error);
      }
    })
}

rs.setSubroutine("getWeather", function (rs, args)  {
  return new rs.Promise(function(resolve, reject) {
    getWeather(args.join(' '), function(error, data){
      if(error) {
        reject(error);
      } else {
        resolve(data.weather[0].description);
      }
    });
  });
});


rs.setSubroutine("checkForRain", function(rs, args) {
  return new rs.Promise(function(resolve, reject) {
    getWeather(args.join(' '), function(error, data){
      if(error) {
        console.error('');
        reject(error);
      } else {
        var rainStatus = data.rain ? 'yup :(' : 'nope';
        resolve(rainStatus);
      }
    });
  });
});

var stockPriceApi = 'http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=TSLA&callback=getQuote';

rs.setSubroutine("getStockPrice", function (rs, args) {
  return new rs.Promise(function(resolve, reject) {
    getStockPrice(stockPriceApi, function(error, data) {
        if(error) {
          console.error('');
          reject(error);
        } else {
          var price = '$' + data.LastPrice;
          resolve(price);
        }
    });
  });
});


// Create a prototypical class for our own chatbot.
var AsyncBot = function(onReady) {
    var self = this;


    // Load the replies and process them.
    rs.loadDirectory("brain", function() {
      rs.sortReplies();
      onReady();
    });

    // This is a function for delivering the message to a user. Its actual
    // implementation could vary; for example if you were writing an IRC chatbot
    // this message could deliver a private message to a target username.
    self.sendMessage = function(username, message) {
      // This just logs it to the console like "[Bot] @username: message"
      console.log(
        ["[Cleo]", message].join(": ").green
      );
    };

    // This is a function for a user requesting a reply. It just proxies through
    // to RiveScript.
    self.getReply = function(username, message, callback) {
      return rs.replyAsync(username, message, self).then(function(reply){
        callback.call(this, null, reply);
      }).catch(function(error) {
        callback.call(this, error);
      });
    }
};

// Create and run the example bot.
var bot = new AsyncBot(function() {
  // Drop into an interactive shell to get replies from the user.
  // If this were something like an IRC bot, it would have a message
  // handler from the server for when a user sends a private message
  // to the bot's nick.
  var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  rl.setPrompt("> ");
  rl.prompt();
  rl.on("line", function(cmd) {
    // If this was an IRC bot, imagine "nick" came from the server as the
    // sending user's IRC nickname.
    nick = "Soandso";
    console.log("[" + 'you' + "] " + cmd);

    // Handle commands.
    if (cmd === "/quit") {
      process.exit(0);
    } else {
      reply = bot.getReply(nick, cmd, function(error, reply){
        if (error) {
          bot.sendMessage(nick, "Oops. The weather service is not cooperating!");
        } else {
          bot.sendMessage(nick, reply);
        }
        rl.prompt();
      });
    }
  }).on("close", function() {
    process.exit(0);
  });
});
