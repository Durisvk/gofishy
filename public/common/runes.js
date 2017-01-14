if(typeof exports != 'undefined') {
  var runes = require('./runes');
}

;(function(exports) {

  var TIME_ACTIVE = 200;

  exports.HasteRune = function(x, y) {

    this.x = x;
    this.y = y;

    this.counter = 0;

    this.player = undefined;

    this.width = 50;
    this.height = 50;

    this.isActivated = false;

    this.type = "haste";

    this.image = undefined;

    this.world = undefined;

    this.color = "#EB3636";

    this.render = function(ctx) {
      if(this.isActivated == false && typeof this.image != undefined)
        ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height/2);
       else if (this.isActivated == true) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
      }

      return this;
    }

    this.update = function() {

      if(typeof this.player != 'undefined') {
        this.counter++;

        this.x = this.player.x;
        this.y = this.player.y;
        this.width = this.player.width;

        this.player.speed = 2 * this.player.originalSpeed;

        if(this.counter >= TIME_ACTIVE) {
          this.deactivate();
        }
      }
    }


    this.activate = function(player, world) {

      this.world = world;
      this.player = player;

      this.player.speed = 2 * this.player.originalSpeed;
    }

    this.deactivate = function() {
      this.player.speed = this.player.originalSpeed;

      if(typeof this.world != 'undefined' && this.world.runes.indexOf(this) != -1)
        this.world.runes.splice(this.world.runes.indexOf(this), 1);
    }


    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        type: this.type,
        isActivated: this.isActivated
      }
    }

    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.type = json.type;
      this.isActivated = json.isActivated;
      return this;
    }

  }


  exports.VolumeRune = function(x, y) {

    this.x = x;
    this.y = y;

    this.counter = 0;

    this.player = undefined;

    this.type = "volume";

    this.width = 50;
    this.height = 50;

    this.isActivated = false;

    this.grown = 0;

    this.image = undefined;

    this.world = undefined;

    this.color = "#EBC005";

    this.render = function(ctx) {
      if(this.isActivated == false && typeof this.image != undefined)
        ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height/2);
      else if (this.isActivated == true) {
       ctx.globalAlpha = 0.5;
       ctx.beginPath();
       ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI, false);
       ctx.fillStyle = this.color;
       ctx.fill();
       ctx.closePath();
       ctx.globalAlpha = 1;
     }

      return this;
    }

    this.update = function() {

      if(typeof this.player != 'undefined') {
        this.counter++;

        this.x = this.player.x;
        this.y = this.player.y;
        this.width = this.player.width;


        if(this.counter >= TIME_ACTIVE) {
          this.deactivate();
        }
      }

    }


    this.activate = function(player, world) {

      this.world = world;
      this.player = player;

      this.grown = (this.player.width - this.player.originalWidth)*1.2

      if(this.player.speed - this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO) > this.world.MINIMAL_SPEED) {
        this.player.speed -= this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);
        this.player.originalSpeed -= this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);
      }
      this.player.grow((this.player.width - this.player.originalWidth)*1.2);




    }

    this.deactivate = function() {

      this.player.minimize(this.grown);

      this.player.speed += this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);
      this.player.originalSpeed += this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);

      if(typeof this.world != 'undefined' && this.world.runes.indexOf(this) != -1)
        this.world.runes.splice(this.world.runes.indexOf(this), 1);

    }

    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        type: this.type,
        isActivated: this.isActivated
      }
    }

    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.type = json.type;
      this.isActivated = json.isActivated;
      return this;
    }

  }


  exports.DecreaseRune = function(x, y) {

    this.x = x;
    this.y = y;

    this.counter = 0;

    this.player = undefined;

    this.type = "decrease";

    this.width = 50;
    this.height = 50;

    this.isActivated = false;

    this.grown = 0;

    this.image = undefined;

    this.world = undefined;

    this.color = "#0015FF";

    this.render = function(ctx) {
      if(this.isActivated == false && typeof this.image != undefined)
        ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height/2);
      else if (this.isActivated == true) {
       ctx.globalAlpha = 0.5;
       ctx.beginPath();
       ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI, false);
       ctx.fillStyle = this.color;
       ctx.fill();
       ctx.closePath();
       ctx.globalAlpha = 1;
     }

      return this;
    }

    this.update = function() {

      if(typeof this.player != 'undefined') {
        this.counter++;

        this.x = this.player.x;
        this.y = this.player.y;
        this.width = this.player.width;


        if(this.counter >= TIME_ACTIVE) {
          this.deactivate();
        }
      }

    }


    this.activate = function(player, world) {

      this.world = world;
      this.player = player;

      this.grown = (this.player.width - this.player.originalWidth)*1.2
      this.player.speed += this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);
      this.player.originalSpeed += this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);

      this.player.minimize((this.player.width - this.player.originalWidth)*1.2);



    }

    this.deactivate = function() {

      this.player.grow(this.grown);

      if(this.player.speed - this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO) > this.world.MINIMAL_SPEED) {
        this.player.speed -= this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);
        this.player.originalSpeed -= this.world.DECREASE_SPEED*(this.grown/this.world.FOOD_INCREASE_SIZE_RATIO);
      }

      if(typeof this.world != 'undefined' && this.world.runes.indexOf(this) != -1)
        this.world.runes.splice(this.world.runes.indexOf(this), 1);

    }

    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        type: this.type,
        isActivated: this.isActivated
      }
    }

    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.type = json.type;
      this.isActivated = json.isActivated;
      return this;
    }

  }


  exports.InvisRune = function(x, y) {

    this.x = x;
    this.y = y;

    this.counter = 0;

    this.player = undefined;

    this.type = "invis";

    this.width = 50;
    this.height = 50;

    this.isActivated = false;

    this.image = undefined;

    this.world = undefined;


    this.render = function(ctx) {
      if(this.isActivated == false && typeof this.image != undefined)
        ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height/2);
      return this;
    }

    this.update = function() {

      if(typeof this.player != 'undefined') {
        this.counter++;

        if(this.counter >= TIME_ACTIVE) {
          this.deactivate();
        }
      }

    }


    this.activate = function(player, world) {

      this.world = world;
      this.player = player;

      this.player.isInvisible = true;




    }

    this.deactivate = function() {

      this.player.isInvisible = false;


      if(typeof this.world != 'undefined' && this.world.runes.indexOf(this) != -1)
        this.world.runes.splice(this.world.runes.indexOf(this), 1);

    }

    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        type: this.type,
        isActivated: this.isActivated
      }
    }

    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.type = json.type;
      this.isActivated = json.isActivated;
      return this;
    }

  }

  exports.SlowRune = function(x, y) {

    this.x = x;
    this.y = y;

    this.counter = 0;

    this.player = undefined;

    this.width = 50;
    this.height = 50;

    this.isActivated = false;

    this.type = "slow";

    this.image = undefined;

    this.world = undefined;

    this.color = "#FF6A00";

    this.render = function(ctx) {
      if(this.isActivated == false && typeof this.image != undefined)
        ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height/2);
       else if (this.isActivated == true) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
      }

      return this;
    }

    this.update = function() {

      if(typeof this.player != 'undefined') {
        this.counter++;

        this.x = this.player.x;
        this.y = this.player.y;
        this.width = this.player.width;

        this.player.speed = this.player.originalSpeed / 2;

        if(this.counter >= TIME_ACTIVE) {
          this.deactivate();
        }
      }
    }


    this.activate = function(player, world) {

      this.world = world;
      this.player = player;

      this.player.speed = this.player.originalSpeed / 2;
    }

    this.deactivate = function() {
      this.player.speed = this.player.originalSpeed * 2;

      if(typeof this.world != 'undefined' && this.world.runes.indexOf(this) != -1)
        this.world.runes.splice(this.world.runes.indexOf(this), 1);
    }


    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        type: this.type,
        isActivated: this.isActivated
      }
    }

    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.type = json.type;
      this.isActivated = json.isActivated;
      return this;
    }

  }

  exports.UnknownRune = function(x, y) {

    this.x = x;
    this.y = y;

    this.counter = 0;

    this.player = undefined;

    this.type = "unknown";

    this.width = 50;
    this.height = 50;

    this.isActivated = false;

    this.image = undefined;

    this.world = undefined;

    this.rune = undefined;

    this.render = function(ctx) {
      if(this.isActivated == false && typeof this.image != undefined)
        ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height/2);
    }

    this.update = function() {

    }

    this.activate = function(player, world) {

      this.world = world;
      this.player = player;


      var rnd = Math.random();
      if(rnd < 1/5) {
        this.rune = new runes.HasteRune(this.x, this.y);
      } else if(rnd < 2/5) {
        this.rune = new runes.VolumeRune(this.x, this.y);
      } else if(rnd < 3/5) {
        this.rune = new runes.DecreaseRune(this.x, this.y);
      } else if(rnd < 4/5){
        this.rune = new runes.InvisRune(this.x, this.y);
      } else {
        this.rune = new runes.SlowRune(this.x, this.y);
      }

      this.rune.activate(this.player, this.world);
      this.rune.isActivated = true;

      this.world.runes.splice(this.world.runes.indexOf(this), 1);
      this.world.runes.push(this.rune);
    }

    this.deactivate = function() {
    }

    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        type: this.type,
        isActivated: this.isActivated
      }
    }

    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.type = json.type;
      this.isActivated = json.isActivated;
      return this;
    }

  }


})(typeof exports === 'undefined'? window : exports);
