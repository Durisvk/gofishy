var worldModule = require("../public/common/world");
var net = require('net');
var mysql = require('mysql');

// Sockets:
//          id: 1 => init
//          id: 2 => mousemove
//          id: 3 => me
//          id: 4 => render
//          id: 5 => endgame
//          id: 6 => activeDown
//          id: 7 => activeUp

var WORLD_WIDTH = 10000;
var WORLD_HEIGHT = 10000;
var FPS = 35;
var PLAYERS_PER_WORLD = 100;
var MAX_PLAYERS = 300;

var worlds = [];

var webSockets = [];

var tcpClients = [];

exports.run = function(wss, router) {

  // Creating the two worlds - one classic, one bonus:
  console.log("Creating first classic world.");
  worlds.push(worldModule.create(WORLD_WIDTH, WORLD_HEIGHT, "classic"));

  console.log("Creating first bonus world.");
  worlds.push(worldModule.create(WORLD_WIDTH, WORLD_HEIGHT, "bonus"));


  // Setting up router API:
  router.get('/info', function(req, res) {
    res.send('{ "clients": ' + (tcpClients.length + webSockets.length) + ', "max": ' + MAX_PLAYERS + ' }');
  })

  // Setting up the TCP:
  var server = net.createServer(function(socket) {
    console.log('Mobile Client connected');

    socket.setNoDelay(true);

    //exports.saveIpAddress(socket.address().address);

    socket.on('data', function(data) {
      try {
        var json = JSON.parse(data.toString());

        if(json.id == 1 && tcpClients.length + webSockets.length < MAX_PLAYERS) {
          // Receiving init message:
          socket.world = findAnEmptyWorld(json.data.worldType);
          socket.player = socket.world.addPlayer(json.data);
          socket.player.endGame = function(timeAlive, kills, score, foodEaten) {
            try {
              socket.write(JSON.stringify({ id: 5, timeAlive: timeAlive, kills: kills, score: score, foodEaten: foodEaten}) + "\n");
            } catch(e) {}
            //saveScore(socket.player.name, timeAlive, kills, score, foodEaten);
            if(tcpClients.indexOf(socket) > -1)
              tcpClients.splice(tcpClients.indexOf(socket), 1);
          }

          tcpClients.push(socket);

          socket.write(JSON.stringify({id: 3, data: socket.player.toJSON()}) + "\n");
        } else if(json.id == 2 && typeof socket.player != 'undefined') {
          // Receiving mouse position:
          socket.player.mx = json.data.mx;
          socket.player.my = json.data.my;
          if(typeof json.data.activeDown != 'undefined')
            socket.player.isActiveDown = json.data.activeDown;
        } else if(json.id == 6 && typeof socket.player != 'undefined') {
          socket.player.isActiveDown = true;
        } else if(json.id == 7 && typeof socket.player != 'undefined') {
          socket.player.isActiveDown = false;
        }
      } catch(e) {}
    });

    socket.on('error', function(error) {
      // On error disconnect the android client:
      console.log("Mobile Client disconnected.");
      socket.world.removePlayer(socket.player);
      if(tcpClients.indexOf(socket) > -1)
        tcpClients.splice(tcpClients.indexOf(socket), 1);
    });
  });

  server.listen(4444, function() {
    console.log("TCP server listening on port 4444");
  });


  // Setting up WebSocket server:
  wss.on('connection', function(ws) {

    console.log("Web Browser Client connected.");

    ws.on('message', function(msg) {
      try {
        var json = JSON.parse(msg);
        if(json.id == 1 && tcpClients.length + webSockets.length < MAX_PLAYERS) {

          var world = findAnEmptyWorld(json.data.worldType);

          // Storing the socket:
          ws.player = world.addPlayer(json.data);
          ws.world = world;
          ws.player.endGame = function(timeAlive, kills, score, foodEaten) {
            try {
              ws.send(JSON.stringify({ id: 5, timeAlive: timeAlive, kills: kills, score: score, foodEaten: foodEaten }));
            } catch(e) {}
            //saveScore(ws.player.name, timeAlive, kills, score, foodEaten);
            if(webSockets.indexOf(ws) > -1)
              webSockets.splice(webSockets.indexOf(ws), 1);
          }

          webSockets.push(ws);

          // Sending information about the player:
          ws.send(JSON.stringify({id: 3, data: ws.player.toJSON()}));


        } else if(json.id == 2 && typeof ws.player != 'undefined') {
          // Receiving the mouse position:
          ws.player.mx = json.data.mx;
          ws.player.my = json.data.my;
        } else if(json.id == 6 && typeof ws.player != 'undefined') {
          ws.player.isActiveDown = true;
        } else if(json.id == 7 && typeof ws.player != 'undefined') {
          ws.player.isActiveDown = false;
        }
      } catch(e) { console.log(e); }
    });


    ws.on("close", function() {
      console.log("Web Browser Client disconnected.");
      if(typeof ws.player != 'undefined')
        ws.player.callEndGame();
      try {
        if (typeof ws != 'undefined' && typeof ws.world != 'undefined') {
            ws.world.removePlayer(ws.player);
        }
        if(webSockets.indexOf(ws) > -1)
          webSockets.splice(webSockets.indexOf(ws), 1);
      } catch(e) {}
    });


  });

  // Setting up the game loop:
  setInterval(function() {

    // Updating the worlds:
    for(var i = 0; i < worlds.length; i++) {
      worlds[i].update();
    }


    // Rendering websocket clients:
    for(var i = 0; i < webSockets.length; i++) {
      try {
        webSockets[i].send(JSON.stringify({id: 4, data: webSockets[i].world.toJSONWithDistance(webSockets[i].player, 'browser')}));
      } catch(e) {
        console.log("Web Browser Client disconnected.");
        webSockets[i].player.callEndGame();
        if(typeof webSockets[i] != 'undefined')
          webSockets[i].world.removePlayer(webSockets[i].player);
        if(webSockets.indexOf(webSockets[i]) > -1)
          webSockets.splice(webSockets.indexOf(webSockets[i]), 1);
      }
    }

    // Rendering TCP clients
    for(var i = 0; i < tcpClients.length; i++) {
      try {
        tcpClients[i].write(JSON.stringify({id: 4, data: tcpClients[i].world.toJSONWithDistance(tcpClients[i].player, 'mobile')}) + "\n");
      } catch(e) {
        console.log("Mobile Client disconnected.");
        tcpClients[i].player.callEndGame();
        if(typeof tcpClients[i] != 'undefined')
          tcpClients[i].world.removePlayer(tcpClients[i].player);
        if(tcpClients.indexOf(tcpClients[i]) > -1)
          tcpClients.splice(tcpClients.indexOf(tcpClients[i]), 1);
      }
    }

  }, 1000/FPS);

function findAnEmptyWorld(type) {
  // If type is not a valid value:
  if(type != "classic" && type != "bonus")
    return;

  // Finding an empty world:
  var world;
  for(var i = 0; i < worlds.length; i++)
    if(worlds[i].players.length < PLAYERS_PER_WORLD && worlds[i].type == type)
      world = worlds[i];

  // Creating new world if there's no free world:
  if(typeof world == 'undefined') {
    console.log("Creating new world.");
    worlds.push(worldModule.create(WORLD_WIDTH, WORLD_HEIGHT, type));
    world = worlds[worlds.length - 1];
  }
  return world;
}


// Setting up mysql connection:
/*var db_config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'qwerty',
  database: 'fishy'
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// Saving an IP address into the database:
exports.saveIpAddress = function(ip) {
  try {
    connection.query('SELECT * FROM users WHERE ip="' + ip + '"', {}, function(err, result) {
      try {
        if(typeof result != 'undefined' && result.length == 0) {
          connection.query('INSERT INTO users SET ?', {'ip': ip}, function(err, result) {});
        }
      } catch(e) {}
    });
  } catch(e) {}
}

function saveScore(name, timeAlive, kills, score, foodEaten) {
  try {

    connection.query('INSERT INTO scores SET ?', {'name': name, 'timeAlive': timeAlive, 'kills': kills, 'score': score, 'foodEaten': foodEaten}, function(err, result) {
      if(err) console.log(err);
    })

  } catch(e) {}
}
*/
}
