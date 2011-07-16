function Rope(game, x, y, len) {
  this.game_ = game;
  this.x_ = x;
  this.y_ = y;
  this.length_ = len;
  this.theta_ = Math.PI / 2;
  this.damp_ = 0.01;
  this.v_ = 0;
  this.attached_ = true;
};

Rope.MAX_V = 0.3;

Rope.RK_PENDULUM = {
  PLUS: function(a, b) { return [a[0] + b[0], a[1] + b[1]]; },
  MULT: function(a, b) { return [a[0] * b, a[1] * b]; },
};

Rope.prototype.pendulumRk_ = function(t, v) {
  return [
    v[1],
    -v[1] * this.damp_ + -9.8 / this.length_ * Math.sin(v[0])
  ];
};

Rope.prototype.tickPendulum_ = function() {
  var newVals = rk4(
      bind(this, this.pendulumRk_),
      0,
      [this.theta_, this.v_],
      0.2,
      Rope.RK_PENDULUM.PLUS,
      Rope.RK_PENDULUM.MULT);
  this.v_ = newVals[1];
  this.theta_ = newVals[0] % (2 * Math.PI);

  if (this.v_ > Rope.MAX_V) {
    this.v_ = Rope.MAX_V;
  } else if (this.v_ < -Rope.MAX_V) {
    this.v_ = -Rope.MAX_V;
  }
};

Rope.prototype.tick = function() {
  if (this.attached_) {
    this.tickPendulum_();
  }
};

Rope.prototype.force = function(amount) {
  this.v_ += amount;
};

Rope.prototype.unattach = function() {
  this.attached_ = false;
};

Rope.prototype.attach = function(x, y, length) {
  this.x_ = x;
  this.y_ = y;
  this.length_ = length;
  this.attached_ = true;
};

Rope.prototype.render = function(renderer) {
  var nx = this.x_ + this.length_ * Math.sin(this.theta_);
  var ny = this.y_ + this.length_ * Math.cos(this.theta_);
  renderer.context().fillRect(nx - 2.5, ny - 2.5, 5, 5);
  renderer.context().beginPath();
  renderer.context().moveTo(this.x_, this.y_);
  renderer.context().lineTo(nx, ny);
  renderer.context().stroke();
};
