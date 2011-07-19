function bind(obj, method) {
  var args = Array.prototype.slice.call(arguments, 2);
  return function() {
    var foundArgs = Array.prototype.slice.call(arguments);
    return method.apply(obj, args.concat(foundArgs));
  };
};

// from: http://paulirish.com/2011/requestanimationrender-for-smart-animating/
var requestAnimFrame = (function(){
  return window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(callback, element){ window.setTimeout(callback, 1000 / 60); };
}());

var Operators = {
  times: function(a, b) { return a * b; },
  plus: function(a, b) { return a + b; }
};

function rk4(fn, t, x, opt_delta, opt_plus, opt_mult) {
  var delta = opt_delta || 1.0;
  var plus = opt_plus || Operators.plus;
  var mult = opt_mult || Operators.mult;

  var a = fn(t,             x);
  var b = fn(t + delta / 2, plus(x, mult(a, delta / 2)));
  var c = fn(t + delta / 2, plus(x, mult(b, delta / 2)));
  var d = fn(t + delta,     plus(x, mult(c, delta)));
  var inner = plus(a, plus(d, plus(mult(b, 2), mult(c, 2))));
  return plus(x, mult(inner, delta / 6));
};

function binarySearch(arr, val, cmp, opt_start, opt_end) {
  var start = opt_start || 0;
  var end = opt_end || arr.length;
  while (end > start) {
    var index = Math.floor((start + end) / 2);
    var cmpResult = cmp(val, arr[index]);
    if (cmpResult < 0) {
      end = index;
    } else if (cmpResult > 0) {
      start = index + 1;
    } else {
      return index;
    }
  }
  return -start - 1;
};

// +----------------------------------------------------------------------------
// | geom namespace defs

var geom = geom || {};

geom.operators = geom.operators || {};

geom.operators.POINT_PLUS = function(p1, p2) {
  return new Point(p1.x + p2.x, p1.y + p2.y);
};
geom.operators.POINT_MULT = function(p1, p2) {
  return new Point(p1.x * p2.x, p1.y * p2.y);
};
geom.operators.POINT_LE = function(p1, p2) {
  return p1.x <= p2.x && p1.y <= p2.y;
};
geom.operators.POINT_GE = function(p1, p2) {
  return p1.x >= p2.x && p1.y >= p2.y;
};

// +----------------------------------------------------------------------------
// | Point class

geom.Point = function(x, y) {
  this.x = x;
  this.y = y;
};

// +----------------------------------------------------------------------------
// | AABB class
geom.AABB = function(x, y, w, h) {
  this.p1 = new Point(x, y);
  this.p2 = new Point(x + w, y + h);
};

geom.AABB.prototype.contains = function(point) {
  return (geom.operators.POINT_LE(this.p1, point) &&
          geom.operators.POINT_GE(this.p2, point));
};

geom.AABB.prototype.overlaps = function(aabb) {
  return !(this.p1.x > aabb.p2.x || this.p2.x < aabb.p2.x ||
           this.p1.y > aabb.p2.y || this.p2.x < aabb.p2.y);
};

// +----------------------------------------------------------------------------
// | Line class
geom.Line = function(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
};

geom.Line.prototype.intersects = function(other) {
  var denom = ((other.p2.y - other.p1.y) * (this.p2.x - this.p1.x) -
               (other.p2.x - other.p1.x) * (this.p2.y - this.p1.y));
  if (denom == 0) {
    return false;
  }
  var t = ((other.p2.x - other.p1.x) * (this.p1.y - other.p1.y) -
           (other.p2.y - other.p1.y) * (this.p1.x - other.p1.x)) / denom;
  if (t < 0 || t > 1) {
    return false;
  }
  return new Point(this.p1.x + t * (this.p2.x - this.p1.x),
                   this.p1.y + t * (this.p2.y - this.p1.y));
};

geom.Line.prototype.sideOf = function(point) {
  return ((this.p2.x - this.p1.x) * (point.y - this.p1.y) -
          (this.p2.y - this.p1.y) * (point.x - this.p2.x));
};
