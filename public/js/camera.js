
  var Camera = function() {

    this.x;
    this.y;
    this.scale = 1.0;

    this.zoomDuration = 500
    this.zoomElapsed = 0;
    this.oldScale = 1;
    this.newScale = 1;

    this.update = function(target, canvasWidth, canvasHeight, worldWidth, worldHeight) {

      this.newScale = Math.pow(target.originalWidth / target.width,  0.2);
      if(this.newScale < 0.129) this.newScale = 0.129

      if(this.zoomElapsed < this.zoomDuration) {
        this.scale = (this.zoomElapsed/this.zoomDuration)*(this.newScale-this.oldScale)+this.oldScale;
        this.zoomElapsed++;
      } else {
        this.scale = this.newScale;
        this.oldScale = this.scale;
        this.zoomElapsed = 0;
      }


      //this.scale = (target.originalWidth / (target.width * 1.2))
      //console.log(this.scale);
      this.x = this.clamp(target.x*this.scale - (canvasWidth/2), 0, worldWidth - canvasWidth/this.scale);
      this.y = this.clamp(target.y*this.scale - (canvasHeight/2), 0, worldHeight - canvasHeight/this.scale);
    }

    this.clamp = function(value, min, max){
        if(value < min*this.scale) return min*this.scale;
        else if(value > max*this.scale) return max*this.scale;
        return value;
    }

    this.transformX = function(x) {
      return x*this.scale - this.x;
    }

    this.transformY = function(y) {
      return y*this.scale - this.y;
    }

  }
