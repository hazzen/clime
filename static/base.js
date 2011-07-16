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
