;(function(exports) {

  exports.Food = function(x, y, canBeSuper) {

    if(typeof canBeSuper == 'undefined') canBeSuper = false;

    this.ACCELERATION = 0.2;

    this.MAX_VELOCITY = 5;

    this.CHANCE_TO_BE_SUPER = 0.1;

    this.image;

    this.firstX = x;
    this.firstY = y;

    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.isSuper = canBeSuper && Math.random() < this.CHANCE_TO_BE_SUPER ? true : false;

    if(this.isSuper) {
      this.width = 20;
      this.height = 20;
    }

    this.velocity = {x: 0, y: 0}
    this.acceleration = {x: this.ACCELERATION, y: 0};

    this.render = function(ctx) {
      if(typeof this.image != undefined) {
        if(this.isSuper == false)
          ctx.drawImage(this.image, this.x-this.width/2, this.y-this.height/2, this.width, this.height);
        else ctx.drawImage(this.image, this.x-this.width, this.y-this.height, this.width * 2, this.height * 2);
      }
      return this;
    }

    this.update = function() {
      this.velocity.x += this.acceleration.x;
      this.velocity.y += this.acceleration.y;

      this.x += this.velocity.x;
      this.y += this.velocity.y;

      if(this.velocity.x > this.MAX_VELOCITY)
        this.acceleration.x = -this.ACCELERATION;
      else if (this.velocity.x < -this.MAX_VELOCITY)
        this.acceleration.x = +this.ACCELERATION;

    }

    this.toJSON = function() {
      var json = {};
      json.x = this.x;
      json.y = this.y;
      json.isSuper = this.isSuper;
      return json;
    }

    this.fromJSON = function(json) {
      if(json != null && typeof json != 'undefined') {
        this.x = json.x;
        this.y = json.y;
        this.isSuper = json.isSuper;
      }
      return this;
    }
  }

})(typeof exports === 'undefined'? window : exports);
