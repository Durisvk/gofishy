;(function() {

  if(document.location.hash != '') {
    if(document.location.hash != '#No Name')
      $('#name').val(document.location.hash.substring(1, document.location.hash.length));

      /*var script = document.createElement( 'script' );
      script.type = 'text/javascript';
      script.src = 'http://dr3k6qonw2kee.cloudfront.net/?oqkrd=609854';
      $("head").append( script );*/

  }

  // Display help:
  var $help = $('div.help');
  $('div#select div.questionmark').on('click', function(e) {
    if($help.data('isShown')) {
      $help.hide();
      $help.data('isShown', false);
    } else {
      $help.css('left', e.pageX + 10);
      $help.css('top', e.pageY + 10);
      $help.show();
      $help.data('isShown', true);
    }
  });


  var images = {
    sharkFrameCols: 4,
    fishFrameCols: 4,
    spikyFrameCols: 4,
    ggmntvfishFrameCols: 4
  };

  servers = getServers();

  images.food = new Image();
  images.food.src = "./resources/images/food.png";

  images.hasteRune = new Image();
  images.hasteRune.src = "./resources/images/haste_rune.png";

  images.volumeRune = new Image();
  images.volumeRune.src = "./resources/images/volume_rune.png";

  images.decreaseRune = new Image();
  images.decreaseRune.src = "./resources/images/decrease_rune.png";

  images.invisRune = new Image();
  images.invisRune.src = "./resources/images/invis_rune.png";

  images.slowRune = new Image();
  images.slowRune.src = "./resources/images/slow_rune.png";

  images.unknownRune = new Image();
  images.unknownRune.src = "./resources/images/unknown_rune.png";

  images.deadFish = new Image();
  images.deadFish.src = "./resources/images/deadfish.png";

  images.coral = new Image();
  images.coral.src = "./resources/images/coral.png";

  images.shark = new Image();
  images.shark.src = "./resources/images/shark.png";

  images.fish = new Image();
  images.fish.src = "./resources/images/fish.png";

  images.spiky = new Image();
  images.spiky.src = "./resources/images/spiky.png";

  images.ggmntvfish = new Image();
  images.ggmntvfish.src = "./resources/images/ggmntvfish.png";


  var $canvas = $('canvas#canvas')
  resizeCanvas();
  var ctx = $canvas.get(0).getContext("2d");


  var camX = 0;
  var camY = 0;


  $(window).on('resize', resizeCanvas);

  function resizeCanvas() {
    $canvas.get(0).width = window.innerWidth;
    $canvas.get(0).height = window.innerHeight;
  }




  $('div#select table tr td a, div#select table tr td img').on('click', function(e) {

    e.preventDefault();
    e.stopImmediatePropagation();

    $('div#select table tr td img.selected').removeClass('selected');
    $(this).parent().children('img').addClass('selected');


  });

  $('div#select a.button').on('click',function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var $soundButton = $('img#sound');
    var soundIsOn = true;

    $('div.best-scores').fadeIn(1000);
    $('div.score').fadeIn(1000);
    $soundButton.fadeIn(1000);


    $('canvas#logo').fadeOut(1000, function() {
      $(this).remove();
    });

    $('div#footer').fadeOut(1000, function() {
      $(this).remove();
    });

    $help.fadeOut(1000, function() {
      $(this).remove();
    })

    var backgroundSound = new Audio('./resources/sounds/River-sounds.mp3');
    backgroundSound.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    backgroundSound.play();

    $soundButton.on('click', function() {
      if(soundIsOn) {
        $(this).attr("src", "../resources/images/sound-off.png");
        backgroundSound.pause();
      } else {
        $(this).attr("src", "../resources/images/sound-on.png");
        backgroundSound.play();
      }
      soundIsOn = !soundIsOn;
    });

    var $self = $(this);
    var type;
    if($('div#select img.selected').length == 0) {
      var rnd = Math.random();
      type = rnd < 0.33333 ? "fish" : rnd < 0.66666 ? "spiky" : "shark";
    } else
      type = $('div#select img.selected').attr('data-type');
    var worldType = $self.html().toLowerCase();
    $('div#select').fadeOut(500);
    var server = '127.0.0.1:3000'//findAvailableServer(servers);
    console.log(server);
    if(typeof server == 'undefined') {
      $('body').append('<h1>Servers are full, try again later</h1>');
      return;
    }
    var ws = new WebSocket("ws://" + server);

    var me;
    var world = new World(0, 0);
    var grid = new Grid();
    var camera = new Camera();

    var sharkSprite = new Sprite(images.shark, images.sharkFrameCols);
    var fishSprite = new Sprite(images.fish, images.fishFrameCols);
    var spikySprite = new Sprite(images.spiky, images.spikyFrameCols);
    var ggmntvfishSprite = new Sprite(images.ggmntvfish, images.ggmntvfishFrameCols);

    var $bestScores = $('table#best-scores');

    ws.onopen = function(event) {
        ws.send(JSON.stringify({id: 1, data: {os: "web", type: type, worldType: worldType, name: $('div#select input#name').val()}}));

        // Mouse Move
        $(document).on('mousemove touchmove', function(e) {

          if(typeof me != 'undefined' && !me.isDead) {
            var x = camera.x <= 0 ? e.pageX - me.x*camera.scale : camera.x >= (world.WIDTH - $canvas.width()/camera.scale)*camera.scale ? (((world.WIDTH - $canvas.width()/camera.scale)*camera.scale) + e.pageX) - me.x*camera.scale : e.pageX - $canvas.width()/2;
            var y = camera.y <= 0 ? e.pageY - me.y*camera.scale : camera.y >= (world.HEIGHT - $canvas.height()/camera.scale)*camera.scale ? (((world.HEIGHT - $canvas.height()/camera.scale)*camera.scale) + e.pageY) - me.y*camera.scale : e.pageY - $canvas.height()/2;

            ws.send(JSON.stringify({id: 2, data:{mx: x, my: y}}));
          }
        });


        // Activating speed with mouse/space click:
        $(document).on('mousedown touchdown', function(e) {
          ws.send(JSON.stringify({id: 6, data:{}}));
          e.preventDefault();
        });
        $(document).on('mouseup touchup', function(e) {
          ws.send(JSON.stringify({id: 7, data:{}}));
          e.preventDefault();
        });

        $(document).on('keydown', function(e) {
          if(e.keyCode == 32)
            ws.send(JSON.stringify({id: 6, data:{}}));
        });

        $(document).on('keyup', function(e) {
          if(e.keyCode == 32)
            ws.send(JSON.stringify({id: 7, data:{}}));
        });
    }


    ws.onmessage = function(msg) {
      json = JSON.parse(msg.data);

      if(json.id == 3)
        // Me message:
        me = new Player(0, 0).fromJSON(json.data);
      else if(json.id == 4) {
        // Render Loop:

        // Updating the world and the player
        world.fromJSON(json.data);
        me.fromJSON(world.getPlayerById(me.id));

        // Drawing score on the screen:
        $('div.score').html('<b>Your current score: ' + Math.floor(me.width - me.originalWidth) + '</b>');

        // Drawing ladder on the screen:
        $bestScores.html('');
        var playersWithBots = world.players.concat(world.bots);
        playersWithBots.sort(function(a, b) {
          return (b.width - b.originalWidth) - (a.width - a.originalWidth);
        });
        for(var i = 0; i < (playersWithBots.length >= 10 ? 10 : playersWithBots.length); i++) {
          if(typeof playersWithBots[i] == 'undefined') continue;
          $bestScores.append((typeof playersWithBots[i].id != 'undefined' && playersWithBots[i].id == me.id ? '<tr class="green-text">' : '<tr>') + '<td>' + (i + 1) + '.</td>'
                              + '<td>' + (playersWithBots[i].name == '' ? 'No Name' : playersWithBots[i].name) + ':</td>'
                              +'<td>' + String(Math.floor(playersWithBots[i].width - playersWithBots[i].originalWidth)) + '</td></tr>');
        }

        // Generating and Updating sprites for players:
        for(var i = 0; i < world.players.length; i++) {
          if(world.players[i].isDead == true)
            world.players[i].image = images.deadFish;
          else if(typeof world.players[i].sprite == 'undefined') {
            switch(world.players[i].type) {
              case 'shark': world.players[i].sprite = sharkSprite;
                break;
              case 'fish': world.players[i].sprite = fishSprite;
                break;
              case 'spiky': world.players[i].sprite = spikySprite;
            }

            /////////////////
            // For FUN!!!: //
            /////////////////
            if(world.players[i].name.toLowerCase() == "ggmntv" && world.players[i].type == "fish")
              world.players[i].sprite = ggmntvfishSprite;
          }
        }

        // And for bots:
        for(var i = 0; i < world.bots.length; i++) {
          if(world.bots[i].isDead == true)
            world.bots[i].image = images.deadFish;
          else if(typeof world.bots[i].sprite == 'undefined') {
            switch(world.bots[i].type) {
              case 'shark': world.bots[i].sprite = sharkSprite;
                break;
              case 'fish': world.bots[i].sprite = fishSprite;
                break;
              case 'spiky': world.bots[i].sprite = spikySprite;
            }
          }
        }

        sharkSprite.update();
        fishSprite.update();
        spikySprite.update();
        ggmntvfishSprite.update();

        // Adding food images:
        for(var i = 0; i < world.food.length; i++) {
          world.food[i].image = images.food;
        }

        // Adding coral images:
        for(var i = 0; i < world.corals.length; i++) {
          world.corals[i].image = images.coral;
        }

        // If we live in bonus world:
        if(typeof world.runes != 'undefined') {
          // Adding runes images:
          for(var i = 0; i < world.runes.length; i++) {
            switch(world.runes[i].type) {
              case "haste": world.runes[i].image = images.hasteRune;
                            break;
              case "volume": world.runes[i].image = images.volumeRune;
                            break;
              case "decrease": world.runes[i].image = images.decreaseRune;
                            break;
              case "invis": world.runes[i].image = images.invisRune;
                            break;
              case "slow": world.runes[i].image = images.slowRune;
                            break;
              case "unknown": world.runes[i].image = images.unknownRune;
                            break;
            }
          }
        }

        // Rendering to the screen:
        camera.update(me, $canvas.width(), $canvas.height(), world.WIDTH, world.HEIGHT);

        ctx.fillStyle = "#2DDBED";
        ctx.fillRect(0,0,world.WIDTH, world.HEIGHT);

        ctx.save();

          // Assigning the camera propositions to the canvas context:
        ctx.translate( -camera.x, -camera.y );
        ctx.scale(camera.scale, camera.scale);

          // Drawing the grid:
        grid.draw(world.WIDTH, world.HEIGHT, ctx);

          // Rendering the world:
        world.render(ctx);

          // Restoring the canvas context state
        ctx.restore();

        // Playing the sounds:
        if(Math.random() >= 0.999 && soundIsOn) {
          new Audio('./resources/sounds/Splashing-water.mp3').play();
        }

        if(Math.random() >= 0.99999 && soundIsOn) {
          new Audio('./resources/sounds/Toilet-flushing.mp3').play();
        }


      } else if(json.id == 5) {
        $('span#timeAlive').html(json.timeAlive);
        $('span#kills').html(json.kills);
        $('span#finalScore').html(Math.floor(json.score));
        $('span#foodEaten').html(json.foodEaten);

        $('div#stats').fadeIn(1000);

        $('div#left-sidebar').fadeIn(1000);

        $('div#right-sidebar').fadeIn(1000);

        setTimeout(function() {

          var href = window.location.href;
          if(href.indexOf('#') != -1)
            href = window.location.href.substring(0, window.location.href.indexOf('#'));

          window.location.href = href + "#" + (me.name == '' ? 'No Name' : me.name);
          window.location.reload();
        }, 7000)
      }
    }
  });

  function findAvailableServer(servers) {
    var ip = servers[0];
    var min_time = Number.POSITIVE_INFINITY;
    for(var i = 0; i < servers.length; i++) {
      var start_time = new Date().getTime();
      jQuery.ajax({
          type: "GET",
          url: 'http://' + servers[i] + '/info',
          success: function (result) {
              var request_time = new Date().getTime() - start_time;
              data = JSON.parse(result);
              if(data.max - data.clients > 0) {
                if(request_time < min_time) {
                  ip = servers[i];
                  min_time = request_time;
                }
              } else if(i == 0)
                ip = undefined;
          },
          async: false
      });
    }
    return ip;
  }

  function getServers() {
    var path = window.location.host;
    path = path.replace(/\/$/, "");

    return JSON.parse($.ajax({
        type: "GET",
        url: "http://" + path + "/servers",
        async: false
    }).responseText).servers;
  }

})();
