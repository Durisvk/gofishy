if(typeof exports != 'undefined') {
    var player = require('./player');
}
;(function(exports) {

  exports.Spiky = function(x, y) {
    if(typeof window !== "undefined")
      Player.call(this, x, y);
    else player.Player.call(this, x, y);

    this.originalWidth = 100;
    this.originalHeight = 50;
    this.width = this.originalWidth;
    this.height = this.originalHeight;

    this.originalSpeed = 9;
    this.speed = 9;
  }

if(typeof window !== "undefined")
  exports.Spiky.prototype = Object.create(Player.prototype);
else
  exports.Spiky.prototype = Object.create(player.Player.prototype);

})(typeof exports === 'undefined'? window : exports);
