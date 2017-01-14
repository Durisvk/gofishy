
if(typeof exports != 'undefined') {
  var shark = require("./shark");
  var fish = require("./fish");
  var spiky = require("./spiky");
  var player = require('./player');
  var food = require('./food');
  var corals = require('./coral');
  var util = require('./util');
  var bot = require('./bot');
  var runes = require('./runes');
}

;(function(exports) {

  exports.create = function(WIDTH, HEIGHT, sockets) {

    var world = new exports.World(WIDTH, HEIGHT, sockets);
    return world;

  }

  exports.World = function(WIDTH, HEIGHT, type) {

    this.TOTAL_PLAYERS_WITH_BOTS_NUMBER = 40;//60;

    this.MAXIMAL_BOTS_WIDTH = 400;

    this.COLLISION_EPSILON_WIDTH = 0.4;
    this.COLLISION_EPSILON_HEIGHT = 0.6;

    this.COLLISION_FOOD_EPSILON_WIDTH = 0.6;
    this.COLLISION_FOOD_EPSILON_HEIGHT = 0.8;

    this.DECREASE_SPEED = 0.01;
    this.MINIMAL_SPEED = 2;

    this.IGNORE_COLLISION_RATIO = 0.1;

    this.SPIKY_INCREASE_SIZE_RATIO = 1.2;
    this.SHARK_INCREASE_SIZE_RATIO = 0.8;

    this.MINIMUM_CORALS = 10;
    this.MAXIMUM_CORALS = 20;

    this.MINIMUM_RUNES = 100;
    this.MAXIMUM_RUNES = 200;

    this.FOOD_INCREASE_SIZE_RATIO = 2.5;

    this.MINIMUM_FOOD = 1300;
    this.FOOD_PACK_MINIMUM = 75;
    this.FOOD_PACK_MAXIMUM = 100;
    this.FOOD_FOR_DEAD_PLAYER_TIMES_WIDTH = 0.1;
    this.FOOD_OFFSET = 500;

    this.LOOSE_WEIGHT_AFTER = 1000;
    this.LOOSE_WEIGHT = 2;
    this.LOOSE_WEIGHT_WHEN_ACTIVE = 2;

    this.looseWeightCounter = 0;

    this.SHOW_BROWSER_RADIUS = 1000;
    this.SHOW_MOBILE_RADIUS = 860;

    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;

    this.type = type;

    this.players = [];
    this.bots = [];
    this.food = [];
    this.corals = [];


    if(this.type == 'bonus')
      this.runes = [];


    this.update = function() {
      var self = this;

      // Updating players:
      for(var i = 0; i < this.players.length; i++)
        this.players[i].update(this.WIDTH, this.HEIGHT, this);

      // Updating the bots:
      for(var i = 0; i < this.bots.length; i++) {
        this.bots[i].update(this.players, this.bots, this.corals, this.food, this.WIDTH, this.HEIGHT);
        // Remove large bots:
        if(this.bots[i].width > this.MAXIMAL_BOTS_WIDTH)
          this.bots.splice(i, 1);
      }

      // Updating the food:
      for(var i = 0; i < this.food.length; i++)
        this.food[i].update();

      // Generating food if required:
      if(this.food.length < this.MINIMUM_FOOD)
        this.generateFood(this.FOOD_OFFSET, this.FOOD_OFFSET, this.WIDTH - this.FOOD_OFFSET, this.HEIGHT - this.FOOD_OFFSET, this.FOOD_PACK_MINIMUM + (Math.random() * (this.FOOD_PACK_MAXIMUM - this.FOOD_PACK_MINIMUM)), true);

      // Generating corals if needed:
      if(this.corals.length < this.MINIMUM_CORALS)
        this.generateCorals(0, 0, this.WIDTH, this.HEIGHT, this.MINIMUM_CORALS + (Math.random() * (this.MAXIMUM_CORALS - this.MINIMUM_CORALS)));

      // Checking collision between food and players:
      for(var i = 0; i < this.players.length; i++)
        for(var j = 0; j < this.food.length; j++) {
          if(this.players[i].isDead) continue;
          if(this.checkCollision(this.players[i], this.food[j], this.COLLISION_FOOD_EPSILON_WIDTH, this.COLLISION_FOOD_EPSILON_HEIGHT)) {
            if(this.players[i].speed - this.DECREASE_SPEED > this.MINIMAL_SPEED) {
              this.players[i].speed -= this.food[j].isSuper ? this.DECREASE_SPEED * 3 : this.DECREASE_SPEED;
              this.players[i].originalSpeed -= this.food[j].isSuper ? this.DECREASE_SPEED * 2 : this.DECREASE_SPEED;
            }
            this.players[i].foodEaten++;
            var increase = this.food[j].isSuper ? this.FOOD_INCREASE_SIZE_RATIO * 3 : this.FOOD_INCREASE_SIZE_RATIO;
            increase *= this.players[i].type == "spiky" ? this.SPIKY_INCREASE_SIZE_RATIO : this.players[i].type == "shark" ? this.SHARK_INCREASE_SIZE_RATIO : 1;
            this.players[i].grow(increase);
            this.food.splice(j, 1);
          }
        }

        // Checking collision between food and bots:
        for(var i = 0; i < this.bots.length; i++)
          for(var j = 0; j < this.food.length; j++)
            if(this.checkCollision(this.bots[i], this.food[j], this.COLLISION_FOOD_EPSILON_WIDTH, this.COLLISION_FOOD_EPSILON_HEIGHT)) {
              var increase = this.food[j].isSuper ? this.FOOD_INCREASE_SIZE_RATIO * 3 : this.FOOD_INCREASE_SIZE_RATIO;
              increase *= this.bots[i].type == "spiky" ? this.SPIKY_INCREASE_SIZE_RATIO : this.bots[i].type == "shark" ? this.SHARK_INCREASE_SIZE_RATIO : 1;
              this.bots[i].grow(increase);
              this.food.splice(j, 1);
            }

      // Checking collision between players and corals:
      for(var i = 0; i < this.players.length; i++)
        for(var j = 0; j < this.corals.length; j++) {
          if(this.players[i].isDead) continue;
          if(this.players[i].width < this.corals[j].width && this.players[i].height < this.corals[j].height) continue;
          if(this.checkCollision(this.players[i], this.corals[j], this.COLLISION_EPSILON_WIDTH, this.COLLISION_EPSILON_HEIGHT)) {
            this.players[i].speed += this.DECREASE_SPEED * 5;
            this.players[i].originalSpeed += this.DECREASE_SPEED * 5;
            this.players[i].minimize(this.FOOD_INCREASE_SIZE_RATIO * 5);
            this.generateFood(this.corals[j].x - this.corals[j].width/2, this.corals[j].y - this.corals[j].height/2, this.corals[j].x + this.corals[j].width/2, this.corals[j].y + this.corals[j].height/2, 1);
          }
        }

      // Checking collision between bots and corals:
      for(var i = 0; i < this.bots.length; i++)
        for(var j = 0; j < this.corals.length; j++) {
          if(this.bots[i].width < this.corals[j].width && this.bots[i].height < this.corals[j].height) continue;
          if(this.checkCollision(this.bots[i], this.corals[j], this.COLLISION_EPSILON_WIDTH, this.COLLISION_EPSILON_HEIGHT)) {
            this.bots[i].speed += this.DECREASE_SPEED * 5;
            this.bots[i].minimize(this.FOOD_INCREASE_SIZE_RATIO * 5);
            this.generateFood(this.corals[j].x - this.corals[j].width/2, this.corals[j].y - this.corals[j].height/2, this.corals[j].x + this.corals[j].width/2, this.corals[j].y + this.corals[j].height/2, 1);
          }
        }

      // Checking collision between players:
      for(var i = 0; i < this.players.length; i++)
        for(var j = 0; j < this.players.length; j++) {
          if(this.players[i].isDead) continue;
          if(this.players[j].isDead) continue;
          if(Math.abs(this.players[i].width - this.players[j].width) < util.max(this.players[i].width - this.players[i].originalWidth, this.players[j].width - this.players[j].originalWidth) * this.IGNORE_COLLISION_RATIO) continue;
          if(i == j) continue;
          if(this.checkCollision(this.players[i], this.players[j], this.COLLISION_EPSILON_WIDTH, this.COLLISION_EPSILON_HEIGHT)) {
            this.players[i].collisionsCounter++;
            this.players[j].collisionsCounter++;
            if(this.players[i].width > this.players[j].width) {
              this.generateFood(this.players[j].x - this.players[j].width/2, this.players[j].y - this.players[j].height/2, this.players[j].x + this.players[j].width/2, this.players[j].y + this.players[j].height/2, this.players[j].width * this.FOOD_FOR_DEAD_PLAYER_TIMES_WIDTH)
              this.players[j].isDead = true;
              return this;
            } else if(this.players[i].width < this.players[j].width) {
              this.generateFood(this.players[i].x - this.players[i].width/2, this.players[i].y - this.players[i].height/2, this.players[i].x + this.players[i].width/2, this.players[i].y + this.players[i].height/2, this.players[i].width * this.FOOD_FOR_DEAD_PLAYER_TIMES_WIDTH)
              this.players[i].isDead = true;
              return this;
            }

          }

        }

      // Checking collision between players and bots:
      for(var i = 0; i < this.players.length; i++)
        for(var j = 0; j < this.bots.length; j++) {
          if(this.players[i].isDead) continue;
          if(Math.abs(this.players[i].width - this.bots[j].width) < util.max(this.players[i].width - this.players[i].originalWidth, this.bots[j].width - this.bots[j].originalWidth) * this.IGNORE_COLLISION_RATIO) continue;
          if(this.checkCollision(this.players[i], this.bots[j], this.COLLISION_EPSILON_WIDTH, this.COLLISION_EPSILON_HEIGHT)) {
            this.players[i].collisionsCounter++;
            if(this.players[i].width > this.bots[j].width) {
              this.generateFood(this.bots[j].x - this.bots[j].width/2, this.bots[j].y - this.bots[j].height/2, this.bots[j].x + this.bots[j].width/2, this.bots[j].y + this.bots[j].height/2, this.bots[j].width * this.FOOD_FOR_DEAD_PLAYER_TIMES_WIDTH)
              if(typeof this.bots[j].endGame != 'undefined' && typeof this.bots[j].endGame == 'function')
                this.bots[j].endGame();
              this.bots.splice(j, 1);
              return this;
            } else if(this.players[i].width < this.bots[j].width) {
              this.generateFood(this.players[i].x - this.players[i].width/2, this.players[i].y - this.players[i].height/2, this.players[i].x + this.players[i].width/2, this.players[i].y + this.players[i].height/2, this.players[i].width * this.FOOD_FOR_DEAD_PLAYER_TIMES_WIDTH)
              this.players[i].isDead = true;
              return this;
            }

          }

        }


      // Checking collision between bots:
      for(var i = 0; i < this.bots.length; i++)
        for(var j = 0; j < this.bots.length; j++) {
          if(i == j) continue;
          if(Math.abs(this.bots[i].width - this.bots[j].width) < util.max(this.bots[i].width - this.bots[i].originalWidth, this.bots[j].width - this.bots[j].originalWidth) * this.IGNORE_COLLISION_RATIO) continue;
          if(this.checkCollision(this.bots[i], this.bots[j], this.COLLISION_EPSILON_WIDTH, this.COLLISION_EPSILON_HEIGHT)) {
            if(this.bots[i].width > this.bots[j].width) {
              this.generateFood(this.bots[j].x - this.bots[j].width/2, this.bots[j].y - this.bots[j].height/2, this.bots[j].x + this.bots[j].width/2, this.bots[j].y + this.bots[j].height/2, this.bots[j].width * this.FOOD_FOR_DEAD_PLAYER_TIMES_WIDTH)
              if(typeof this.bots[j].endGame != 'undefined' && typeof this.bots[j].endGame == 'function')
                this.bots[j].endGame();
              this.bots.splice(j, 1);
              return this;
            } else if(this.bots[i].width < this.bots[j].width) {
              this.generateFood(this.bots[i].x - this.bots[i].width/2, this.bots[i].y - this.bots[i].height/2, this.bots[i].x + this.bots[i].width/2, this.bots[i].y + this.bots[i].height/2, this.bots[i].width * this.FOOD_FOR_DEAD_PLAYER_TIMES_WIDTH)
              if(typeof this.bots[i].endGame != 'undefined' && typeof this.bots[i].endGame == 'function')
                this.bots[i].endGame();
              this.bots.splice(i, 1);
              return this;
            }

          }

        }


      // Loosing weight over the certain time:
      this.looseWeightCounter++;
      if(this.looseWeightCounter == this.LOOSE_WEIGHT_AFTER) {
        for(var i = 0; i < this.players.length; i++) {
          this.players[i].minimize(this.LOOSE_WEIGHT);
          this.players[i].speed += this.DECREASE_SPEED;
          this.players[i].originalSpeed += this.DECREASE_SPEED;
        }

        for(var i = 0; i < this.bots.length; i++) {
          this.bots[i].minimize(this.LOOSE_WEIGHT);
        }
        this.looseWeightCounter = 0;
      }

        // Active for players:
      for(var i = 0; i < this.players.length; i++) {
        if(this.players[i].isActiveDown && this.players[i].width - this.players[i].originalWidth > 0) {
          this.players[i].activeCounter++;
          this.players[i].speed = this.players[i].ACTIVE_SPEED*this.players[i].originalSpeed;
          if(this.players[i].activeCounter >= this.players[i].RELEASE_FOOD_WHEN_ACTIVE / this.players[i].width) {
            this.players[i].activeCounter = 0;
            this.players[i].minimize(this.LOOSE_WEIGHT_WHEN_ACTIVE);
            if(typeof this.players[i].angle != 'undefined') {
                var tailX = this.players[i].x + Math.cos(this.players[i].angle + Math.PI)*this.players[i].width;
                var tailY = this.players[i].y + Math.sin(this.players[i].angle + Math.PI)*this.players[i].height;
                this.food.push(new food.Food(tailX, tailY));
            }
          }
        } else {
          this.players[i].speed = this.players[i].originalSpeed;
        }
      }


      // Number of players with bots:
      var players_with_bots = this.players.length + this.bots.length;
      // If there's not enough players fill the place with bots:
        if(players_with_bots < this.TOTAL_PLAYERS_WITH_BOTS_NUMBER) {
        this.bots.push(new bot.AI_Bot(Math.random() * this.WIDTH, Math.random() * this.HEIGHT));
      }


      // If there's enough players remove the bots
      if(players_with_bots > this.TOTAL_PLAYERS_WITH_BOTS_NUMBER && this.bots.length > 0)
        this.bots.splice(0, players_with_bots - this.TOTAL_PLAYERS_WITH_BOTS_NUMBER > this.bots.length ? this.bots.length : players_with_bots - this.TOTAL_PLAYERS_WITH_BOTS_NUMBER);

      // If we live in bonus world:
      if(typeof this.runes != 'undefined') {

        // Generate some amount of runes:
        if(this.runes.length < this.MINIMUM_RUNES) {
          for(var i = 0; i < this.MINIMUM_RUNES - this.runes.length; i++) {
            for(var j = 0; j < Math.random() * (this.MAXIMUM_RUNES - this.MINIMUM_RUNES); j++) {
              var rnd = Math.random();
              if(rnd < 1/6) {
                this.runes.push(new runes.HasteRune(Math.random() * this.WIDTH, Math.random() * this.HEIGHT));
              } else if(rnd < 2/6) {
                this.runes.push(new runes.VolumeRune(Math.random() * this.WIDTH, Math.random() * this.HEIGHT));
              } else if(rnd < 3/6) {
                this.runes.push(new runes.DecreaseRune(Math.random() * this.WIDTH, Math.random() * this.HEIGHT));
              } else if(rnd < 4/6){
                this.runes.push(new runes.InvisRune(Math.random() * this.WIDTH, Math.random() * this.HEIGHT));
              } else if(rnd < 5/6){
                this.runes.push(new runes.SlowRune(Math.random() * this.WIDTH, Math.random() * this.HEIGHT));
              } else {
                this.runes.push(new runes.UnknownRune(Math.random() * this.WIDTH, Math.random() * this.HEIGHT));
              }
            }
          }
        }

        // Updating the runes:
        for(var i = 0; i < this.runes.length; i++) {

          this.runes[i].update();

          if(typeof this.runes[i] == 'undefined')
            continue;

          if(!this.runes[i].isActivated) {

            // Checking collision between rune and the players:
            for(var j = 0; j < this.players.length; j++) {
              if(typeof this.runes[i] == 'undefined') continue;
              if(this.checkCollision(this.players[j], this.runes[i], this.COLLISION_EPSILON_WIDTH, this.COLLISION_EPSILON_HEIGHT)) {
                for(var k = 0; k < this.runes.length; k++) {
                  if(this.runes[k].player == this.players[j])
                    this.runes[k].deactivate();
                }
                if(typeof this.runes[i] != 'undefined') {
                  var rune = this.runes[i];
                  rune.activate(this.players[j], this);
                  rune.isActivated = true;
                }
              }
            }

            // Checking collision between rune and the bots:
            for(var j = 0; j < this.bots.length; j++) {
              if(typeof this.runes[i] == 'undefined') continue;
              if(this.checkCollision(this.bots[j], this.runes[i], this.COLLISION_EPSILON_WIDTH, this.COLLISION_EPSILON_HEIGHT)) {
                for(var k = 0; k < this.runes.length; k++) {
                  if(this.runes[k].player == this.bots[j])
                    this.runes[k].deactivate();
                }
                if(typeof this.runes[i] != 'undefined') {
                  var rune = this.runes[i];
                  rune.activate(this.bots[j], this);
                  rune.isActivated = true;
                }
              }
            }

          }
        }

      }

      return this;
    }

    this.render = function(ctx) {

        for(var i = 0; i < this.food.length; i++)
          this.food[i].render(ctx);

        if(typeof this.runes != 'undefined') {
          for(var i = 0; i < this.runes.length; i++)
            this.runes[i].render(ctx);
        }

        for(var i = 0; i < this.bots.length; i++)
          this.bots[i].render(ctx);

        for(var i = 0; i < this.players.length; i++)
          this.players[i].render(ctx);

        for(var i = 0; i < this.corals.length; i++)
          this.corals[i].render(ctx);

        return this;
    }


    this.addPlayer = function(data) {
      if(typeof data == 'undefined')
        return;
      var player;
      switch(data.type) {
        case "shark": player = new shark.Shark(Math.random()*this.WIDTH, Math.random()*this.HEIGHT);
        break;
        case "fish": player = new fish.Fish(Math.random()*this.WIDTH, Math.random()*this.HEIGHT);
        break;
        case "spiky": player = new spiky.Spiky(Math.random()*this.WIDTH, Math.random()*this.HEIGHT);
        break;
      }
      if(typeof player != 'undefined') {
        player.type = data.type;
        player.name = data.name.length <= 15 ? data.name : "";
        this.players.push(player);
        return player;
      }
    }

    this.removePlayer = function(player) {
      if(this.players.indexOf(player) > -1)
        this.players.splice(this.players.indexOf(player), 1);
      return this;
    }

    this.getPlayerById = function(id) {
      for(var i = 0; i < this.players.length; i++) {
        if(this.players[i].id == id)
          return this.players[i];
      }
    }

    this.generateFood = function(x1, y1, x2, y2, how_many, canBeSuper) {
      if(typeof canBeSuper == 'undefined') canBeSuper = false;
      for(var i = 0; i <= Math.floor(how_many); i++) {
        if(typeof window == 'undefined')
          this.food.push(new food.Food(x1 + Math.random() * (x2 - x1), y1 + Math.random() * (y2 - y1), canBeSuper));
        else
          this.food.push(new Food(x1 + Math.random() * (x2 - x1), y1 + Math.random() * (y2 - y1), canBeSuper));
      }
    }

    this.generateCorals = function(x1, y1, x2, y2, how_many) {
      for(var i = 0; i <= Math.floor(how_many); i++) {
        if(typeof window == 'undefined')
          this.corals.push(new corals.Coral(x1 + Math.random() * (x2 - x1), y1 + Math.random() * (y2 - y1)));
        else
          this.corals.push(new Coral(x1 + Math.random() * (x2 - x1), y1 + Math.random() * (y2 - y1)));
      }
    }

    this.toJSON = function() {
      var players = [];
      for(var i = 0; i < this.players.length; i++) {
        players.push(this.players[i].toJSON());
      }

      var bots = [];
      for(var i = 0; i < this.bots.length; i++) {
        bots.push(this.bots[i].toJSON());
      }

      var food = [];
      for(var i = 0; i < this.food.length; i++) {
        food.push(this.food[i].toJSON());
      }

      if(typeof this.runes != 'undefined') {
        var runes = [];
        for(var i = 0; i < this.runes.length; i++) {
          runes.push(this.runes[i].toJSON());
        }
      }

      var corals = [];
      for(var i = 0; i < this.corals.length; i++) {
        corals.push(this.corals[i].toJSON());
      }


      return {
        players: players,
        bots: bots,
        food: food,
        runes: runes,
        corals: corals,
        WIDTH: this.WIDTH,
        HEIGHT: this.HEIGHT
      };
    }

    this.toJSONWithDistance = function(player, device) {
      var showRadius = device == 'browser' ? this.SHOW_BROWSER_RADIUS : this.SHOW_MOBILE_RADIUS;

      var scale = Math.pow(player.originalWidth / player.width,  0.2);

      var players = [];
      for(var i = 0; i < this.players.length; i++) {
        if(this.players[i] == player || this.players[i].isInvisible == false)
          players.push(this.players[i].toJSON());
      }

      this.bots.sort(function(a, b) {
        return (b.width - b.originalWidth) - (a.width - a.originalWidth);
      });

      var bots = [];
      for(var i = 0; i < this.bots.length; i++) {
        if(i <= 10) {
          if(this.bots[i].isInvisible == false)
            bots.push(this.bots[i].toJSON());
        } else {
          if(this.bots[i].isInvisible == false && util.getDistance(player, this.bots[i]) < showRadius/scale)
            bots.push(this.bots[i].toJSON());
        }
      }

      var food = [];
      for(var i = 0; i < this.food.length; i++) {
        if(util.getDistance(player, this.food[i]) < showRadius/scale)
          food.push(this.food[i].toJSON());
      }

      if(typeof this.runes != 'undefined') {
        var runes = [];
        for(var i = 0; i < this.runes.length; i++) {
          if(util.getDistance(player, this.runes[i]) < showRadius/scale)
            runes.push(this.runes[i].toJSON());
        }
      }

      var corals = [];
      for(var i = 0; i < this.corals.length; i++) {
        if(util.getDistance(player, this.corals[i]) < showRadius/scale)
          corals.push(this.corals[i].toJSON());
      }

      return {
        players: players,
        bots: bots,
        food: food,
        runes: runes,
        corals: corals,
        WIDTH: this.WIDTH,
        HEIGHT: this.HEIGHT
      };
    }

    this.fromJSON = function(json) {
      this.players = [];
      this.bots = [];
      this.food = [];
      this.corals = [];
      this.WIDTH = json.WIDTH;
      this.HEIGHT = json.HEIGHT;


      for(var i = 0; i < json.players.length; i++) {
          this.players.push(new Player().fromJSON(json.players[i]));
      }

      for(var i = 0; i < json.bots.length; i++) {
          this.bots.push(new AI_Bot(0,0).fromJSON(json.bots[i]));
      }

      for(var i = 0; i < json.food.length; i++) {
          this.food.push(new Food(0,0).fromJSON(json.food[i]));
      }

      if(typeof json.runes != 'undefined') {
        this.runes = [];
        for(var i = 0; i < json.runes.length; i++) {
          switch(json.runes[i].type) {
              case "haste": this.runes.push(new HasteRune(0, 0).fromJSON(json.runes[i]))
                            break;
              case "volume": this.runes.push(new VolumeRune(0, 0).fromJSON(json.runes[i]))
                            break;
              case "decrease": this.runes.push(new DecreaseRune(0, 0).fromJSON(json.runes[i]));
                            break;
              case "invis": this.runes.push(new InvisRune(0, 0).fromJSON(json.runes[i]));
                            break;
              case "slow": this.runes.push(new SlowRune(0, 0).fromJSON(json.runes[i]));
                            break;
              case "unknown": this.runes.push(new UnknownRune(0, 0).fromJSON(json.runes[i]));
                            break;
          }
        }
      }

      for(var i = 0; i < json.corals.length; i++) {
          this.corals.push(new Coral(0,0).fromJSON(json.corals[i]));
      }

      return this;
    }

    this.checkCollision = function(entity1, entity2, epsilonWidth, epsilonHeight) {

      // If they are too far away, return false:
      var dist = util.getDistance(entity1, entity2);
      if(dist > entity1.width + entity2.width && dist > entity1.height + entity2.height) return false;


      // Separating axis theorem:
      var width1 = entity1.width;
      var height1 = entity1.height;
      var width2 = entity2.width;
      var height2 = entity2.height;

      width1 *= epsilonWidth;
      height1 *= epsilonHeight;

      width2 *= epsilonWidth;
      height2 *= epsilonWidth;


      width1 /= 2;
      height1 /= 2;
      width2 /= 2;
      height2 /= 2;


       if(typeof entity1.angle == 'undefined')
        entity1.angle = 0;

      if(typeof entity2.angle == 'undefined')
        entity2.angle = 0;

       var radius1 = Math.sqrt((height1 * height1)+(width1 * width1));
       var radius2 = Math.sqrt((height2 * height2)+(width2 * width2));

       var angle1 = Math.asin(height1/radius1);
       var angle2 = Math.asin(height2/radius2);

       var x1 = [];
       var x2 = [];
       var y1 = [];
       var y2 = [];

       x1[0] = entity1.x + radius1 * Math.cos(entity1.angle - angle1);
       y1[0] = entity1.y + radius1 * Math.sin(entity1.angle - angle1);
       x1[1] = entity1.x + radius1 * Math.cos(entity1.angle + angle1);
       y1[1] = entity1.y + radius1 * Math.sin(entity1.angle + angle1);
       x1[2] = entity1.x + radius1 * Math.cos(entity1.angle + Math.PI - angle1);
       y1[2] = entity1.y + radius1 * Math.sin(entity1.angle + Math.PI - angle1);
       x1[3] = entity1.x + radius1 * Math.cos(entity1.angle + Math.PI + angle1);
       y1[3] = entity1.y + radius1 * Math.sin(entity1.angle + Math.PI + angle1);


       x2[0] = entity2.x + radius2 * Math.cos(entity2.angle - angle2);
       y2[0] = entity2.y + radius2 * Math.sin(entity2.angle - angle2);
       x2[1] = entity2.x + radius2 * Math.cos(entity2.angle + angle2);
       y2[1] = entity2.y + radius2 * Math.sin(entity2.angle + angle2);
       x2[2] = entity2.x + radius2 * Math.cos(entity2.angle + Math.PI - angle2);
       y2[2] = entity2.y + radius2 * Math.sin(entity2.angle + Math.PI - angle2);
       x2[3] = entity2.x + radius2 * Math.cos(entity2.angle + Math.PI + angle2);
       y2[3] = entity2.y + radius2 * Math.sin(entity2.angle + Math.PI + angle2);


       var axisx = [];
       var axisy = [];

       axisx[0] = x1[0] - x1[1];
       axisy[0] = y1[0] - y1[1];
       axisx[1] = x1[2] - x1[1];
       axisy[1] = y1[2] - y1[1]

       axisx[2] = x2[0] - x2[1];
       axisy[2] = y2[0] - y2[1];
       axisx[3] = x2[2] - x2[1];
       axisy[3] = y2[2] - y2[1]

       for(var k = 0; k < 4; k++) {

         var proj = x1[0] * axisx[k] + y1[0] * axisy[k];

         var minProj1 = proj;
         var maxProj1 = proj;

         for(var i = 1; i < 4; i++) {
           proj = x1[i] * axisx[k] + y1[i] * axisy[k];

           if(proj < minProj1)
            minProj1 = proj;
           else if(proj > maxProj1)
            maxProj1 = proj;
         }

         proj = x2[0] * axisx[k] + y2[0] * axisy[k];

         var minProj2 = proj;
         var maxProj2 = proj;

         for(var j = 1; j < 4; j++) {
            proj = x2[j] * axisx[k] + y2[j] * axisy[k];

            if(proj < minProj2)
              minProj2 = proj;
            else if(proj > maxProj2)
              maxProj2 = proj;
         }

         if(maxProj2 < minProj1 || maxProj1 < minProj2)
          return false;

       }

       return true;
    }

  }
})(typeof exports === 'undefined'? window : exports);
