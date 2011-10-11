function DudeEnergy(energy, opt_maxEnergy) {
  this.energy = energy;
  this.maxEnergy = opt_maxEnergy || energy;
  this.sapTypes_ = {};
};

DudeEnergy.SapTypes = {
  STATIONARY: 1,
  DRAINER: 2,
  CHECKPOINT: -4
};

DudeEnergy.prototype.addSap = function(type) {
  this.sapTypes_[type] = true;
};

DudeEnergy.prototype.refill = function() {
  this.energy = this.maxEnergy;
};

DudeEnergy.prototype.tick = function(t) {
  this.energy -= t;
  for (var key in this.sapTypes_) {
    this.energy -= key * t;
  }
  this.energy = Math.min(this.maxEnergy, Math.max(0, this.energy));
  this.sapTypes_ = {};
};

DudeEnergy.prototype.render = function(renderer) {
  var width = renderer.width() * (this.energy / this.maxEnergy);
  renderer.context().fillStyle = '#A5FF7F';
  renderer.context().fillRect((renderer.width() - width) / 2, 0, width, 10);
};

function Dude(game, x, y) {
  this.game_ = game;
  this.x = x;
  this.y = y;
  this.pvx_ = 0;
  this.vx = 0;
  this.pvy_ = 0;
  this.vy = 0;
  this.jumpFrame_ = 0;
  this.energy = new DudeEnergy(10);
};

Dude.MAX_VX = 300;
Dude.ACCEL_X = 20;
Dude.DEACCEL_X = 10;

Dude.MAX_VY = 500;
Dude.ACCEL_Y = 40;

Dude.SIZE = 2 * Game.SQUARE_SIZE;

DEBUG_collisions = [];

Dude.COMPARE_BLOCK_X_ASCENDING = function(b1, b2) { return b1.x - b2.x; };
Dude.COMPARE_BLOCK_X_DESCENDING = function(b1, b2) { return b2.x - b1.x; };
Dude.COMPARE_BLOCK_Y_ASCENDING = function(b1, b2) { return b1.y - b2.y; };
Dude.COMPARE_BLOCK_Y_DESCENDING = function(b1, b2) { return b2.y - b1.y; };

Dude.prototype.checkGround_ = function(t) {
  var blocks = this.game_.level.blocksInQuadrants(
      new geom.AABB(this.x, this.y, Dude.SIZE, Dude.SIZE),
      new geom.AABB(this.x + Math.min(0, t * this.vx),
                    this.y + Math.min(0, t * this.vy),
                    Dude.SIZE + Math.max(0, t * this.vx),
                    Dude.SIZE + Math.max(0, t * this.vy)));

  DEBUG_collisions.push(blocks);
  if (DEBUG_collisions.length > 20) {
    DEBUG_collisions.shift();
  }
  if (this.game_.keyPressed('q')) {
    try {
      throw 0;
    } catch (e) {
    }
  }

  var game = this.game_;
  function bestOfMany(quadList, op) {
    var best = null;
    for (var i = quadList.length; i > 0; --i) {
      var toCheck = blocks[quadList[i - 1]];
      if (toCheck && toCheck.length) {
        for (var j = toCheck.length; j > 0; --j) {
          toCheck[j - 1].playerTouched(game);
          if (toCheck[j - 1].solid && (!best || op(best, toCheck[j - 1]) < 0)) {
            best = toCheck[j - 1];
          }
        }
      }
    }
    return best;
  }
  // Throway call just to get the playerTouched calls.
  bestOfMany([Level.QUADRANTS.MC], function() { return false; });
  var vCollide = false;
  var hCollide = false;
  if (this.vy != 0) {
    var op = (this.vy < 0
              ? Dude.COMPARE_BLOCK_Y_ASCENDING
              : Dude.COMPARE_BLOCK_Y_DESCENDING);
    var best = null;
    // If we weren't previously moving left or right, there is no point in
    // checking the corner collision, as the current left/right input might be
    // invalid.
    if (this.pvx_ != 0) {
      best = bestOfMany(Level.QUADRANTS.VERTICAL, op);
    } else {
      best = bestOfMany([Level.QUADRANTS.UC, Level.QUADRANTS.LC], op);
    }
    if (best) {
      this.y = best.y;
      if (this.vy >= 0) {
        this.y -= Dude.SIZE;
        for (var i = blocks[Level.QUADRANTS.LC].length; i > 0; --i) {
          if (blocks[Level.QUADRANTS.LC][i - 1].solid) {
            this.jumpFrame_ = 0;
            break;
          }
        }
      } else {
        this.y += best.h;
      }
      vCollide = true;
    }
  }
  if (this.vx != 0) {
    var op = (this.vx < 0
              ? Dude.COMPARE_BLOCK_X_ASCENDING
              : Dude.COMPARE_BLOCK_X_DESCENDING);
    var best = null;
    // Ditto the no-previous movement comment from above.
    if (this.vy != 0 && !vCollide && this.pvy_ != 0) {
      best = bestOfMany(Level.QUADRANTS.HORIZONTAL, op);
    } else {
      best = bestOfMany([Level.QUADRANTS.ML, Level.QUADRANTS.MR], op);
    }
    if (best) {
      this.x = best.x;
      if (this.vx >= 0) {
        this.x -= Dude.SIZE;
      } else {
        this.x += best.w;
      }
      hCollide = true;
    }
  }
  if (hCollide) {
    this.vx = 0;
  }
  if (vCollide) {
    this.vy = 0;
  }
};

Dude.prototype.tick = function(t) {
  this.pvx_ = this.vx;
  this.pvy_ = this.vy;
  if (this.game_.keyDown(37)) {
    this.vx -= Dude.ACCEL_X;
  }
  if (this.game_.keyDown(39)) {
    this.vx += Dude.ACCEL_X;
  }
  this.vx = Math.min(Dude.MAX_VX, Math.max(-Dude.MAX_VX, this.vx));
  if (this.vx > Dude.DEACCEL_X) {
    this.vx -= Dude.DEACCEL_X;
  } else if (this.vx < -Dude.DEACCEL_X) {
    this.vx += Dude.DEACCEL_X;
  } else if (this.vx != 0) {
    this.vx = 0;
  }
  if (this.game_.keyDown('z') && this.jumpFrame_ < 10) {
    ++this.jumpFrame_;
    if (this.jumpFrame_ == 1) {
      this.vy -= 5 * Dude.ACCEL_Y;
    } else {
      this.vy -= 1.5 * Dude.ACCEL_Y;
    }
  }
  this.vy += Dude.ACCEL_Y;

  this.checkGround_(t);

  this.x += t * this.vx;
  this.y += t * this.vy;
  this.energy.tick(t);
};

Dude.prototype.render = function(renderer) {
  renderer.context().fillStyle = '#cdf';
  renderer.context().fillRect(
      this.x, this.y, Dude.SIZE, Dude.SIZE);
};

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
  if ((this.stabilized_ && (newVals[1] > 0) != (this.stableRv_ > 0)) ||
      !this.stabilized_) {
    this.stabilized_ = false;
    this.rv_ = newVals[1] / t;
    this.theta_ = newVals[0] % (2 * Math.PI);
  } else {
    this.rv_ = 0;
  }

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

Rope.prototype.stabilize = function() {
  if (!this.stabilized_) {
    this.stabilized_ = true;
    if (this.rv_ != 0) {
      this.stableRv_ = this.rv_;
    }
  }
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

Rope.prototype.setAttached = function(attached) {
  if (this.attached_ == attached) return attached;
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
    this.xv_ = -this.rv_ * Math.sin(this.theta_) * this.length_;
    this.yv_ = this.rv_ * Math.cos(this.theta_) * this.length_;
  }
  return !attached;
};

Rope.prototype.toggleAttached = function() {
  this.setAttached(!this.attached_);
};

Rope.prototype.switchEnd = function() {
  var reverseBend = function(bend) {
    bend.x = bend.x + bend.length * Math.cos(bend.theta);
    bend.y = bend.y + bend.length * Math.sin(bend.theta);
    bend.theta = (bend.theta + Math.PI) % (2 * Math.PI);
  };
  var bendsLen = this.bends_.length;
  if (bendsLen) {
    var asLine = this.asLine();
    this.bends_.push({
      theta: (this.theta_ + Math.PI) % (2 * Math.PI),
      length: this.length_,
      x: asLine.p2.x,
      y: asLine.p2.y,
      clockwise: this.rv_ > 0});
    this.bends_.reverse();
    for (var i = 1; i < bendsLen - 1; ++i) {
      reverseBend(this.bends_[i]);
    }
    var lastBend = this.bends_.pop();
    reverseBend(lastBend);
    this.x_ = lastBend.x;
    this.y_ = lastBend.y;
    this.theta_ = lastBend.theta;
  } else {
    var nx = this.x_ + this.length_ * Math.cos(this.theta_);
    var ny = this.y_ + this.length_ * Math.sin(this.theta_);
    this.x_ = nx;
    this.y_ = ny;
    this.theta_ = (this.theta_ + Math.PI) % (2 * Math.PI);
  }
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
