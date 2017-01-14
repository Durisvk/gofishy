

var Sprite = function(image, frameCols) {

  this.image = image;
  this.width = this.image.width;
  this.height = this.image.height;
  this.frameCols = frameCols
  this.frameWidth = this.width / this.frameCols;
  this.frameIndex = 0,
  this.tickCount = 0,
  this.ticksPerFrame = 3,

  this.update = function () {
    this.tickCount += 1;

    if (this.tickCount > this.ticksPerFrame) {

        this.tickCount = 0;

        // Go to the next frame
        this.frameIndex += 1;
    }
    if(this.frameIndex >= this.frameCols) {
      this.frameIndex = 0;
    }
  };

  this.render = function(ctx, x, y, width, height) {
    ctx.drawImage(
      this.image,
      this.frameIndex * this.frameWidth,
      0,
      this.frameWidth,
      this.height,
      x,
      y,
      width,
      height
    );
  }


}
