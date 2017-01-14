var PORT = 3000;

var http = require('http');
var path = require('path');

var game = require('./custom_modules/game');

var express = require('express');

var isMobile = require('ismobilejs');

var router = express();
var server = http.createServer(router).listen(PORT, function() {
  console.log("Listening on port " + PORT);
});
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server });

router.use(express.static('public'));

// Add headers
router.use(function (req, res, next) {
  try {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
  } catch(e) {}
});


router.get("/", function(req, res) {
  try {
    if(isMobile(req.headers['user-agent']).any)
      res.sendFile(path.join(__dirname, 'public/html/', 'index-mobile.html'));
    else
      res.sendFile(path.join(__dirname, 'public/html/', 'index.html'));

      try {
        var ip = req.headers['x-forwarded-for'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress || "";

        //game.saveIpAddress(ip);
      } catch(e) {}
    } catch(e) {}
});

router.get("/servers", function(req, res) {
  var servers = [
    "185.8.166.41",
    //"104.155.110.226",
    //"104.155.113.109"
    // Here put next servers. The last server will be preferred.
  ]
  res.send('{ "servers": ' + JSON.stringify(servers) + ' }');
});

setInterval(function() {
  // If it's 4:00am stop the server:
  var date = new Date();
  if(date.getHours() == 2 && date.getMinutes() == 0) {
    console.log("It's time to stop!");
    process.exit();
  }
}, 10000);

try {
  game.run(wss, router);
} catch(e) {}
