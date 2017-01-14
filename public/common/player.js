if(typeof exports != 'undefined') {
  var util = require('./util');
}


;(function(exports) {

  exports.Player = function(x, y) {

    this.ACTIVE_SPEED = 2;
    this.RELEASE_FOOD_WHEN_ACTIVE = 500;
    this.LERP_CONSTANT = 1.2;

    this._createId = function(length) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < length; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    this.id = this._createId(10);

    this.name = "";

    this.x = x;
    this.y = y;
    /** in radians */
    this.angle;

    this.mx = 0;
    this.my = 0;

    this.originalWidth = 50;
    this.originalHeight = 50;

    this.width = this.originalWidth;
    this.height = this.originalHeight;

    this.originalSpeed = 10;
    this.isInvisible = false;
    this.speed = 10;

    this.socket = undefined;
    this.type = "fish";

    this.sprite = undefined;

    this.isActiveDown = false;
    this.activeCounter = 0;

    this.isDead = false;
    this.CYCLES_DEAD = 50;
    this.deadCounter = 0;

    this.image = undefined;

    this.collisionsCounter = 0;
    this.timeBegin = Math.floor(Date.now() / 1000);
    this.foodEaten = 0;


    this.render = function(ctx) {
      if(this.isInvisible)
        ctx.globalAlpha = 0.4;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      if(this.isDead && typeof this.image != 'undefined') {
        ctx.globalAlpha = 0.2;
        ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
        ctx.globalAlpha = 1;
      } else if(typeof this.sprite != 'undefined')
        this.sprite.render(ctx, -this.width/2, -this.height/2, this.width, this.height);
      ctx.restore();
      if(this.isInvisible)
        ctx.globalAlpha = 1;
      ctx.fillStyle = "#FFFFFF";
      ctx.font="30px Verdana";
      ctx.fillText(this.name, this.x - this.width/2, this.y + this.height/2 + 50);
    }

    this.update = function(WIDTH, HEIGHT, world) {

      if(this.isDead) {
        this.deadCounter++;
        if(this.deadCounter >= this.CYCLES_DEAD) {
          if(typeof this.endGame != 'undefined' && typeof this.endGame == 'function')
            try {
              this.callEndGame();
              if(world.players.indexOf(this) != -1)
                world.players.splice(world.players.indexOf(this), 1)
            } catch(e) {}
        }
      } else {
        this.angle = Math.atan2(this.my,this.mx);
        this.x += Math.cos(this.angle)*this.speed;
        this.y += Math.sin(this.angle)*this.speed;

        if(this.x - this.width/2 <= 0) { this.x = this.width/2; }
        if(this.y - this.height/2 <= 0) { this.y = this.height/2; }
        if(this.x + this.width/2 >= WIDTH) { this.x = WIDTH - this.width/2; }
        if(this.y + this.height/2 >= HEIGHT) { this.y = HEIGHT - this.height/2; }
      }
    }

    this.callEndGame = function() {
      this.endGame(Math.floor(Date.now() / 1000) - this.timeBegin, this.collisionsCounter - 1, this.width - this.originalWidth, this.foodEaten);
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

    this.toJSON = function() {
      return {
        id: this.id,

        name: this.name,

        x: this.x,
        y: this.y,
        /** in radians */
        angle: this.angle,

        originalWidth: this.originalWidth,
        originalHeight: this.originalHeight,

        width: this.width,
        height: this.height,

        isInvisible: this.isInvisible,
        isDead: this.isDead,
        type: this.type
      }
    }

    this.fromJSON = function(json) {
      if(typeof json == 'undefined') return this;

      this.id = json.id;

      this.name = json.name;

      this.x = json.x;
      this.y = json.y;
      this.angle = json.angle;

      this.originalWidth = json.originalWidth;
      this.originalHeight = json.originalHeight;

      this.width = json.width;
      this.height = json.height;

      this.isDead = json.isDead;
      this.isInvisible = json.isInvisible;
      this.type = json.type;
      return this;
    }

  }


})(typeof exports === 'undefined'? window : exports);
