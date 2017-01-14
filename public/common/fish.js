if(typeof exports != 'undefined') {
    var player = require('./player');
}
;(function(exports) {

  exports.Fish = function(x, y) {
    if(typeof window !== "undefined")
      Player.call(this, x, y);
    else player.Player.call(this, x, y);

    this.originalWidth = 100;
    this.originalHeight = 50;
    this.width = this.originalWidth;
    this.height = this.originalHeight;

    this.originalSpeed = 10;
    this.speed = 10;
  }

if(typeof window !== "undefined")
  exports.Fish.prototype = Object.create(Player.prototype);
else
  exports.Fish.prototype = Object.create(player.Player.prototype);

})(typeof exports === 'undefined'? window : exports);
