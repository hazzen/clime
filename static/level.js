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
  if (minIndex < 0) minIndex = -minIndex - 2;
  if (maxIndex < 0) maxIndex = -maxIndex - 1;
  maxIndex = Math.min(arr.length - 1, maxIndex);
  minIndex = Math.max(0, minIndex);
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
  } else {
    ctx.lineTo(renderer.xOffset() + renderer.width(), arr[bounds.max].y);
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

Level.prototype.collidesBoundsLine_ = function(arr, line, opt_intersected) {
  var bounds = this.boundsFor_(arr,
                               Math.min(line.p1.y, line.p2.y),
                               Math.max(line.p1.y, line.p2.y));
  var collided = false;
  var intersected = opt_intersected || [];
  for (; bounds.min < bounds.max; ++bounds.min) {
    var p1 = arr[bounds.min];
    var p2 = arr[bounds.min + 1];
    var wallLine = new geom.Line(p1, p2);
    var maybeIntersect = wallLine.intersects(line);
    if (maybeIntersect) {
      collided = true;
      intersected.push(wallLine);
    }
  }
  return collided;
}

Level.prototype.collidesBoundsCircle_ = function(arr, point, radius) {
  var bounds = this.boundsFor_(arr,
                               point.y - radius,
                               point.y + radius);
  for (; bounds.min < bounds.max; ++bounds.min) {
    var p1 = arr[bounds.min];
    var p2 = arr[bounds.min + 1];
    var maybeIntersect = new geom.Line(p1, p2).circleIntersects(point, radius);
    if (maybeIntersect) {
      return maybeIntersect;
    }
  }
  return null;
}

Level.prototype.collidesLine = function(line, opt_intersected) {
  var l = this.collidesBoundsLine_(this.leftBounds_, line, opt_intersected);
  var r = this.collidesBoundsLine_(this.rightBounds_, line, opt_intersected);
  return l || r;
};

Level.prototype.collidesCircle = function(point, opt_radius) {
  var radius = opt_radius || 1;

  return (this.collidesBoundsCircle_(this.leftBounds_, point, radius) ||
          this.collidesBoundsCircle_(this.rightBounds_, point, radius));
};
