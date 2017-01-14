

;(function(exports) {

  exports.Coral = function(x, y) {

    this.width = 200;
    this.height = 200;

    this.image;

    this.x = x;
    this.y = y;

    this.angle = Math.random() * 2 * Math.PI;

    this.toJSON = function() {
      return {
        x: this.x,
        y: this.y,
        angle: this.angle
      }
    }

    this.fromJSON = function(json) {
      this.x = json.x;
      this.y = json.y;
      this.angle = json.angle;
      return this;
    }

    this.render = function(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      if(typeof this.image != undefined)
        ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);

      ctx.restore();
      return this;
    }

  }

})(typeof exports === 'undefined'? window : exports);
