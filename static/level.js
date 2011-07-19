function Level(game) {
  this.leftBounds_ = [];
  this.rightBounds_ = [];
};

Level.COMPARE_BY_Y = function(val, point) {
  // Ignore NaN, inf, and other bad cases.
  return val - point.y;
};

Level.prototype.tick = function(t) {
};

Level.prototype.boundsFor_ = function(arr, minY, maxY) {
  var minIndex = binarySearch(arr, minY, Level.COMPARE_BY_Y);
  var maxIndex = binarySearch(arr, maxY, Level.COMPARE_BY_Y);
  if (minIndex < 0) minIndex = -minIndex - 1;
  if (maxIndex < 0) maxIndex = -maxIndex - 1;
  if (maxIndex >= arr.length) --maxIndex;
  return {min:minIndex, max:maxIndex};
};

Level.prototype.renderSide_ = function(renderer, arr, leftIsFilled) {
  var minY = renderer.yOffset();
  var maxY = renderer.yOffset() + renderer.height();
  var bounds = this.boundsFor_(arr, minY, maxY);
  var ctx = renderer.context();

  ctx.beginPath();
  ctx.moveTo(arr[bounds.min].x, arr[bounds.min].y);
  bounds.min++;
  for (; bounds.min <= bounds.max; ++bounds.min) {
    ctx.lineTo(arr[bounds.min].x, arr[bounds.min].y);
  }
  if (leftIsFilled) {
    ctx.lineTo(renderer.xOffset(), arr[bounds.max].y);
    ctx.lineTo(renderer.xOffset(), minY);
  } else {
    ctx.lineTo(renderer.xOffset() + renderer.width(), arr[bounds.max].y);
    ctx.lineTo(renderer.xOffset() + renderer.width(), minY);
  }
  ctx.closePath();
  ctx.fill();
};

Level.prototype.render = function(renderer) {
  this.renderSide_(renderer, this.leftBounds_, true);
  this.renderSide_(renderer, this.rightBounds_, false);
};

Level.prototype.addLeftBound = function(point) {
  this.leftBounds_.push(point);
};

Level.prototype.addRightBound = function(point) {
  this.rightBounds_.push(point);
};
