if(typeof window == 'undefined') {
  var util = require('./util');
  var names = require('./names')
}

;(function(exports) {

  exports.AI_Bot = function(x, y) {

    this.LERP_CONSTANT = 0.5;

    this.x = x;
    this.y = y;

    this.name = "";

    this.dir = {x: 0, y: 0};

    this.originalWidth = 100;
    this.originalHeight = 50;

    this.width = this.originalWidth;
    this.height = this.originalHeight;

    this.sprite = undefined;

    var rnd = Math.random();
    this.type = rnd < 1/3 ? "shark" : rnd < 2/3 ? "fish" : "spiky";

    // in radians:
    this.angle = 0;

    this.maximalSpeed = this.type == "shark" ? 11 : this.type == "spiky" ? 9 : 10;

    this.originalSpeed = this.maximalSpeed;
    this.speed = this.originalSpeed;

    this.weightedDirections = [];

    this.isInvisible = false;

    this.activeCounter = 0;


    // Wandering variables:
    this.WANDER_CHANGE_DIRECTION_AFTER = 100;
    this.wanderCounter = 0;
    this.lastWanderX = Math.random() * 10 - 5;
    this.lastWanderY = Math.random() * 10 - 5
    this.WANDER_WEIGHT = Math.random() * 5;

    // Find food variables:
    this.FIND_FOOD_WEIGHT = 10;

    // Flee variables:
    this.FLEE_RADIUS = 500;
    this.FLEE_WEIGHT = 6000;

    // Charge variables:
    this.CHARGE_RADIUS = 500;
    this.CHARGE_WEIGHT = 6000;

    // Hide variables:
    this.HIDE_RADIUS = 300 + Math.random() * 400;
    this.HIDE_WEIGHT = Math.random() * 80;

    this.ACTIVE_DIST = 300;

    this.update = function(players, bots, corals, food, WIDTH, HEIGHT) {

      if(typeof this.name == 'undefined' || this.name == "")
        this.generateName();


      this.speed = (this.originalWidth / this.width) * this.maximalSpeed;

      this.dir.x = 0;
      this.dir.y = 0;

      this.weightedDirections = [];

      // Finding the closest player/bot:
      var closest = undefined;
      var dist = Number.POSITIVE_INFINITY;

      for(var i = 0; i < players.length; i++) {

        var d = util.getDistance(this, players[i]);
        if(d < dist && players[i].isInvisible == false) {
          closest = players[i];
          dist = d;
        }
      }

      for(var i = 0; i < bots.length; i++) {
        if(bots[i] == this) continue;
        var d = util.getDistance(this, bots[i]);
        if(d < dist && bots[i].isInvisible == false) {
          closest = bots[i];
          dist = d;
        }
      }


      // AI logic:
      this.AI_Wander();
      this.AI_FindFood(food);
      this.AI_FleeFromLargerFish(closest, dist);
      this.AI_ChargeSmallerFish(closest, dist);
      this.AI_HideInTheCoral(closest, dist, corals);


      // Sum up weighted directions:
      for(var i = 0; i < this.weightedDirections.length; i++) {
        this.dir.x += this.weightedDirections[i].x * this.weightedDirections[i].weight;
        this.dir.y += this.weightedDirections[i].y * this.weightedDirections[i].weight;
      }

      // Lerp the bot to slightly rotate to the target:
      this.dir = util.lerp(util.getVectorFromAngle(this.angle, util.getVectorLength(this.dir)), this.dir, this.LERP_CONSTANT);

      // Move bot into a resulting direction:
      this.angle = Math.atan2(this.dir.y,this.dir.x);
      this.x += Math.cos(this.angle)*this.speed;
      this.y += Math.sin(this.angle)*this.speed;

      // If bot hits the boundaries of a world:
      if(this.x - this.width/2 <= 0) { this.x = this.width/2; }
      if(this.y - this.height/2 <= 0) { this.y = this.height/2; }
      if(this.x + this.width/2 >= WIDTH) { this.x = WIDTH - this.width/2; }
      if(this.y + this.height/2 >= HEIGHT) { this.y = HEIGHT - this.height/2; }
    }

    this.generateName = function() {
      this.name = names.list[Math.floor(Math.random() * (names.list.length + 1))];
    }

    this.render = function(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      if(typeof this.sprite != 'undefined')
        this.sprite.render(ctx, -this.width/2, -this.height/2, this.width, this.height);
      ctx.restore();
      ctx.fillStyle = "#FFFFFF";
      ctx.font="30px Verdana";
      ctx.fillText(this.name, this.x - this.width/2, this.y + this.height/2 + 50);
    }

    this.grow = function(grow_ratio) {
      this.width += grow_ratio * (this.originalWidth /(this.originalWidth + this.originalHeight));
      this.height += grow_ratio * (this.originalHeight /(this.originalWidth + this.originalHeight));
    }


    this.minimize = function(grow_ratio) {
      if(this.width - this.originalWidth > 0) {
        this.width -= grow_ratio * (this.originalWidth /(this.originalWidth + this.originalHeight));
        this.height -= grow_ratio * (this.originalHeight /(this.originalWidth + this.originalHeight));
      }
      if(this.width - this.originalWidth < 0) {
        this.width = this.originalWidth;
        this.height = this.originalHeight;
      }
      if(this.height - this.originalHeight < 0) {
        this.height = this.originalHeight;
        this.width  = this.originalHeight;
      }
    }


    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.width = json.width;
      this.height = json.height;
      this.originalWidth = json.originalWidth;
      this.originalHeight = json.originalHeight;
      this.type = json.type;
      this.angle = json.angle;
      this.speed = json.speed;
      this.name = json.name;

      return this;
    }

    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        /** in radians */
        angle: this.angle,

        originalWidth: this.originalWidth,
        originalHeight: this.originalHeight,

        width: this.width,
        height: this.height,

        speed: this.speed,
        type: this.type,
        name: this.name
      }
    }

    // AI part: ----------------------------------------------------------------

    this.AI_Wander = function() {

      if(this.wanderCounter == this.WANDER_CHANGE_DIRECTION_AFTER) {
        this.lastWanderX = Math.random() * 10 - 5;
        this.lastWanderY = Math.random() * 10 - 5;
        this.wanderCounter = 0;
      }

      this.weightedDirections.push({
        x: this.lastWanderX,
        y: this.lastWanderY,
        weight: this.WANDER_WEIGHT
      });

      this.wanderCounter++;
    }

    this.AI_FindFood = function(food) {

      // Find the closest food:
      var closest = undefined;
      var dist = Number.POSITIVE_INFINITY;

      for(var i = 0; i < food.length; i++) {
        var d = util.getDistance(this, food[i])
        if(d < dist) {
          closest = food[i];
          dist = d;
        }
      }

      // I have nothing to eat!!!
      if(typeof closest == 'undefined')
        return;

      this.weightedDirections.push({
          x: (closest.x - this.x),
          y: (closest.y - this.y),
          weight: this.FIND_FOOD_WEIGHT
      });
    }


    this.AI_FleeFromLargerFish = function(closest, dist) {

      // Nothing to fear:
      if(typeof closest == 'undefined')
        return;

      // The closest is smaller:
      if(closest.width < this.width)
        return;


      // If enemy is far away:
      if(dist - closest.width > this.FLEE_RADIUS)
        return;


      this.weightedDirections.push({
        x: -(closest.x - this.x),
        y: -(closest.y - this.y),
        weight: this.FLEE_WEIGHT / dist
      });

    }

    this.AI_ChargeSmallerFish = function(closest, dist) {


      // Nothing to charge:
      if(typeof closest == 'undefined')
        return;

      // If the closest fish is larger:
      if(closest.width > this.width)
        return;

      // If enemy is far away:
      if(dist - closest.width > this.CHARGE_RADIUS)
        return;

      this.weightedDirections.push({
        x: closest.x - this.x,
        y: closest.y - this.y,
        weight: this.CHARGE_WEIGHT / dist
      });

    }

    this.AI_HideInTheCoral = function(closestFish, dist, corals) {

      if(corals.length <= 0)
        return;

      if(corals[0].width < this.width || corals[0].height < this.height)
        return;

      if(dist > this.HIDE_RADIUS)
        return;

      if(typeof closestFish == 'undefined')
        return;


      if(closestFish.width < corals[0].width || closestFish.height < corals.height)
        return;

      var closestCoral = undefined;
      var dist = Number.POSITIVE_INFINITY;

      for(var i = 0; i < corals.length; i++) {
        var d = util.getDistance(this, corals[i]);
        if(d < dist) {
          closestCoral = corals[i];
          dist = d;
        }
      }

      // Just for safety:
      if(typeof closestCoral == 'undefined') return;


      this.weightedDirections.push({
        x: closestCoral.x - this.x,
        y: closestCoral.y - this.y,
        weight: this.HIDE_WEIGHT
      });

    }

  }


})(typeof exports === 'undefined'? window : exports);
