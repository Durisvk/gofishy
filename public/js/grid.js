
var Grid = function() {

  this.color = '#22C9DA';
  this.p = 10;


  this.draw = function(width, height, ctx) {

    ctx.beginPath();
    for (var x = 0; x <= width; x += 40) {
      ctx.moveTo(0.5 + x + this.p, this.p);
      ctx.lineTo(0.5 + x + this.p, height + this.p);
    }


    for (var x = 0; x <= height; x += 40) {
        ctx.moveTo(this.p, 0.5 + x + this.p);
        ctx.lineTo(width + this.p, 0.5 + x + this.p);
    }

    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.closePath();

  }

}
