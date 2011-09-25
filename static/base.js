// MonkeyPatch in "inheritance".
Function.prototype.inherits = function(clazz) {
  var ctor = this.prototype.constructor;
  this.prototype = new clazz();
  this.prototype.constructor = ctor;
  // Maybe add super?
  return this;
};

function sgn(n) {
  return n < 0 ? -1 : (n > 0 ? 1 : 0);
};

function max(arr, opt_cmp) {
  var l = arr.length;
  var b = arr[0];
  for (var i = 1; i < l; ++i) {
    if (opt_cmp) {
      if (opt_cmp(b, arr[i]) < 0) {
        b = arr[i];
      }
    } else if (arr[i] > b) {
      b = arr[i];
    }
  }
  return b;
}

function min(arr, opt_cmp) {
  var l = arr.length;
  var b = arr[0];
  for (var i = 1; i < l; ++i) {
    if (opt_cmp) {
      if (opt_cmp(b, arr[i]) > 0) {
        b = arr[i];
      }
    } else if (arr[i] < b) {
      b = arr[i];
    }
  }
  return b;
}

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
  return new geom.Point(p1.x + p2.x, p1.y + p2.y);
};
geom.operators.POINT_MINUS = function(p1, p2) {
  return new geom.Point(p1.x - p2.x, p1.y - p2.y);
};
geom.operators.POINT_MULT = function(p1, p2) {
  return new geom.Point(p1.x * p2.x, p1.y * p2.y);
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

geom.Point.prototype.plus = function(o) {
  return geom.operators.POINT_PLUS(this, o);
};

geom.Point.prototype.minus = function(o) {
  return geom.operators.POINT_MINUS(this, o);
};

geom.Point.prototype.times = function(o) {
  return new geom.Point(this.x * o, this.y * o);
};

geom.Point.prototype.dot = function(o) {
  return this.x * o.x + this.y * o.y;
};

// +----------------------------------------------------------------------------
// | AABB class
geom.AABB = function(x, y, w, h) {
  this.p1 = new geom.Point(x, y);
  this.p2 = new geom.Point(x + w, y + h);
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

geom.Line.prototype.projectPoint = function(point, opt_distance) {
  var norm = this.normalized();
  var p1ToMe = point.minus(this.p1);
  var pointOn = this.p1.plus(norm.times(norm.dot(p1ToMe)));
  if (opt_distance) {
    var orth = this.normal();
    if (p1ToMe.dot(orth) > 0) {
      opt_distance *= -1;
    }
    return pointOn.plus(orth.times(opt_distance));
  }
  return pointOn;
};

geom.Line.prototype.intersects = function(other) {
  var denom = ((other.p2.y - other.p1.y) * (this.p2.x - this.p1.x) -
               (other.p2.x - other.p1.x) * (this.p2.y - this.p1.y));
  if (denom == 0) {
    return false;
  }
  var t1 = ((other.p2.x - other.p1.x) * (this.p1.y - other.p1.y) -
            (other.p2.y - other.p1.y) * (this.p1.x - other.p1.x)) / denom;
  var t2 = ((this.p2.x - this.p1.x) * (this.p1.y - other.p1.y) -
            (this.p2.y - this.p1.y) * (this.p1.x - other.p1.x)) / denom;
  if (t1 < 0 || t2 < 0 || t1 > 1 || t2 > 1) {
    return false;
  }
  return new geom.Point(this.p1.x + t1 * (this.p2.x - this.p1.x),
                        this.p1.y + t1 * (this.p2.y - this.p1.y));
};

geom.Line.prototype.mag2 = function() {
  var dx = this.p2.y - this.p1.y;
  var dy = this.p2.x - this.p1.x;
  return Math.pow(dx, 2) + Math.pow(dy, 2);
};

geom.Line.prototype.mag = function() {
  return Math.pow(this.mag2(), 0.5);
};

geom.Line.prototype.normalized = function() {
  var mag = this.mag();
  return new geom.Point((this.p2.x - this.p1.x) / mag,
                        (this.p2.y - this.p1.y) / mag);
};

geom.Line.prototype.normal = function() {
  var mag = this.mag();
  return new geom.Point((this.p1.y - this.p2.y) / mag,
                        (this.p2.x - this.p1.x) / mag);
};

geom.Line.prototype.circleIntersects = function(center, radius) {
  var norm = this.normal();
  return this.intersects(new geom.Line(
      center.plus(norm.times(radius)),
      center.plus(norm.times(-radius))));
};

geom.Line.prototype.sideOf = function(point) {
  return ((this.p2.x - this.p1.x) * (point.y - this.p1.y) -
          (this.p2.y - this.p1.y) * (point.x - this.p2.x));
};

function Rgb(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Rgb.prototype.toCssString = function() {
  var as16 = function(n) {
    var s = n.toString(16);
    while (s.length < 2) {
      s = '0' + s;
    }
    if (s.length > 2) {
      s = s.substr(0, 2);
    }
    return s;
  };
  return '#' + as16(this.r) + as16(this.g) + as16(this.b);
};

Rgb.prototype.toRgbString = function() {
  return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255) + ')';
};
