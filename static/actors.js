function Rope(game, x, y, len) {
  this.game_ = game;
  this.x_ = x;
  this.y_ = y;
  this.length_ = len;
  this.theta_ = 5 * Math.PI / 3;
  this.v_ = 0;
};

Rope.prototype.tick = function() {
  var g = 9.8;
  var ropeLength = this.length_;
  var rkFn = function(t, v) {
    return [
      v[1],
      -g / ropeLength * Math.sin(v[0])
    ];
  };
  var rkPlus = function(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  };
  var rkMult = function(a, b) {
    return [a[0] * b, a[1] * b];
  };

  var newVals = rk4(rkFn, 0, [this.theta_, this.v_], 0.1, rkPlus, rkMult);
  this.v_ = /*this.v_ + 0.1 * */newVals[1];
  this.theta_ = (/*this.theta_ + 0.1 * */newVals[0]) % (2 * Math.PI);
};

Rope.prototype.render = function(renderer) {
  var nx = this.x_ + this.length_ * Math.sin(this.theta_);
  var ny = this.y_ + this.length_ * Math.cos(this.theta_);
  renderer.context().fillRect(nx, ny, 5, 5);
  renderer.context().moveTo(this.x_, this.y_);
  renderer.context().lineTo(nx, ny);
  renderer.context().stroke();
};
