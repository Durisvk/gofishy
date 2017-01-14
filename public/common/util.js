

exports.getDistance = function(entity1, entity2) {
  return Math.sqrt(Math.pow(entity2.x - entity1.x, 2) +  Math.pow(entity2.y - entity1.y, 2));
}

exports.lerp = function(a, b, t) {

  var ret = {x: 0, y: 0};

  ret.x = a.x + t * (b.x - a.x);
  ret.y = a.y + t * (b.y - a.y)
  return ret;
}

/**
 * @param angle in radians
 * @param desiredLength can be undefined
 */
exports.getVectorFromAngle = function(angle, desiredLength) {

  if(typeof desiredLength == 'undefined')
    return {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
  else return {
    x: Math.cos(angle) * desiredLength,
    y: Math.sin(angle) * desiredLength
  }
}

exports.getVectorLength = function(vector) {
  return Math.sqrt(vector.x*vector.x + vector.y*vector.y);
}

exports.max = function() {
  var max = arguments[0];
  for(var i = 1; i < arguments.length; i++)
    if(max < arguments[i])
      max = arguments[i];
  return max;
}
