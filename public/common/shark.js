if(typeof exports != 'undefined') {
    var player = require('./player');
}
;(function(exports) {

  exports.Shark = function(x, y) {
    if(typeof window !== "undefined")
      Player.call(this, x, y);
    else player.Player.call(this, x, y);

    this.originalWidth = 100;
    this.originalHeight = 50;
    this.width = this.originalWidth;
    this.height = this.originalHeight;

    this.originalSpeed = 11;
    this.speed = 11;
  }

if(typeof window !== "undefined")
  exports.Shark.prototype = Object.create(Player.prototype);
else
  exports.Shark.prototype = Object.create(player.Player.prototype);

})(typeof exports === 'undefined'? window : exports);
