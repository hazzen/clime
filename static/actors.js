function Rope(game, x, y, len) {
  this.game_ = game;
  this.x_ = x;
  this.y_ = y;
  this.length_ = len;
  this.theta_ = Math.PI / 2;
  this.damp_ = 0.01;
  this.rv_ = 0;
  this.attached_ = true;
  this.xv_ = 0;
  this.yv_ = 0;
  this.bends_ = [];
};

Rope.MAX_V = 4.0;

Rope.RK_PENDULUM = {
  PLUS: function(a, b) { return [a[0] + b[0], a[1] + b[1]]; },
  MULT: function(a, b) { return [a[0] * b, a[1] * b]; },
};

Rope.prototype.pendulumRk_ = function(t, v) {
  return [
    v[1],
    -v[1] * this.damp_ + -0.5 / this.length_ * -Math.cos(v[0])
  ];
};

Rope.prototype.tickPendulum_ = function(t) {
  var newVals = rk4(
      bind(this, this.pendulumRk_),
      0,
      [this.theta_, this.rv_ * t],
      1,
      Rope.RK_PENDULUM.PLUS,
      Rope.RK_PENDULUM.MULT);
  this.rv_ = newVals[1] / t;
  this.theta_ = newVals[0] % (2 * Math.PI);

  if (this.rv_ > Rope.MAX_V) {
    this.rv_ = Rope.MAX_V;
  } else if (this.rv_ < -Rope.MAX_V) {
    this.rv_ = -Rope.MAX_V;
  }
};

Rope.prototype.tickFreeFall_ = function(t) {
  this.x_ += t * this.xv_;
  this.y_ += t * this.yv_;
  this.yv_ += t * 300;
  this.theta_ += t * this.rv_;
  this.theta_ = this.theta_ % (2 * Math.PI);
};

Rope.prototype.tick = function(t) {
  if (this.attached_) {
    this.tickPendulum_(t);
  } else {
    this.tickFreeFall_(t);
  }
  var bendsLength = this.bends_.length;
  if (bendsLength > 0) {
    var lastBend = this.bends_[bendsLength - 1];
    var distClockwise = (this.theta_ - lastBend.theta) % (2 * Math.PI);
    if (distClockwise < 0) {
      distClockwise += 2 * Math.PI;
    }
    var distCounterClockwise = 2 * Math.PI - distClockwise;
    if ((distClockwise > distCounterClockwise) == lastBend.clockwise) {
      this.x_ = lastBend.x;
      this.y_ = lastBend.y;
      this.length_ = lastBend.length;
      this.bends_.pop();
    }
  }
};

Rope.prototype.pushClockwise = function() { this.force(4000.0); };
Rope.prototype.pushCounterClockwise = function() { this.force(-4000.0); };

Rope.prototype.force = function(amount) {
  this.rv_ += amount / (this.length_ * this.length_);
};

Rope.prototype.lengthen = function() {
  this.length_ += 1.5;
};

Rope.prototype.shorten = function() {
  this.length_ -= 1.5;
};

Rope.prototype.render = function(renderer) {
  var line = this.asLine();
  renderer.context().fillRect(line.p1.x - 4.5, line.p1.y - 4.5, 9, 9);
  renderer.context().fillRect(line.p2.x - 2.5, line.p2.y - 2.5, 5, 5);
  renderer.context().beginPath();
  renderer.context().moveTo(line.p2.x, line.p2.y);
  renderer.context().lineTo(line.p1.x, line.p1.y);
  for (var i = this.bends_.length; i > 0; --i) {
    renderer.context().lineTo(this.bends_[i - 1].x, this.bends_[i - 1].y);
  }
  renderer.context().stroke();
};

Rope.prototype.toggleAttached = function() {
  this.attached_ = !this.attached_;
  if (this.attached_) {
    var nx = this.x_ - this.length_ / 2 * Math.cos(this.theta_);
    var ny = this.y_ - this.length_ / 2 * Math.sin(this.theta_);
    this.x_ = nx;
    this.y_ = ny;
    this.xv_ = 0;
    this.yv_ = 0;
  } else {
    var nx = this.x_ + this.length_ / 2 * Math.cos(this.theta_);
    var ny = this.y_ + this.length_ / 2 * Math.sin(this.theta_);
    this.x_ = nx;
    this.y_ = ny;
    this.xv_ = this.rv_ * Math.cos(this.theta_) * this.length_;
    this.yv_ = -this.rv_ * Math.sin(this.theta_) * this.length_;
  }
};

Rope.prototype.switchEnd = function() {
  // TODO: FIXME.
  if (this.bends_.length) {
    return;
  }
  /*
  this.bends_.reverse();
  for (var i = this.bends_.length; i > 0; --i) {
    var bend = this.bends_[i];
    bend.theta = (bend.theta + Math.PI) % (2 * Math.PI);
  }
  */
  var nx = this.x_ + this.length_ * Math.cos(this.theta_);
  var ny = this.y_ + this.length_ * Math.sin(this.theta_);
  this.x_ = nx;
  this.y_ = ny;
  this.theta_ = this.theta_ + Math.PI;
};

Rope.prototype.asLine = function() {
  var x1, y1, x2, y2;
  if (this.attached_) {
    x1 = this.x_;
    y1 = this.y_;
    x2 = this.x_ + this.length_ * Math.cos(this.theta_);
    y2 = this.y_ + this.length_ * Math.sin(this.theta_);
  } else {
    var xd = this.length_ / 2 * Math.cos(this.theta_);
    var yd = this.length_ / 2 * Math.sin(this.theta_);
    x1 = this.x_ - xd;
    y1 = this.y_ - yd;
    x2 = this.x_ + xd;
    y2 = this.y_ + yd;
  }
  return new geom.Line(new geom.Point(x1, y1), new geom.Point(x2, y2));
};

Rope.prototype.bend = function(point) {
  var len = Math.pow(
      Math.pow(point.x - this.x_, 2) + Math.pow(point.y - this.y_, 2),
      0.5);
  var theta = Math.atan2(point.y - this.y_, point.x - this.x_);
  this.bends_.push({
      theta: theta,
      length: this.length_,
      x: this.x_,
      y: this.y_,
      clockwise: this.rv_ > 0});
  this.x_ = point.x;
  this.y_ = point.y;
  this.length_ -= len;
};
