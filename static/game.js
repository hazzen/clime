// +----------------------------------------------------------------------------
// | Game
function Game(renderer) {
  //this.rope_ = new Rope(this, 300, 0, 50);
  this.renderer = renderer;
  this.dude = new Dude(this, 8, 25);
  this.keyDown_ = {};
  this.keyDownCounts_ = {};
  this.level_ = null;
  this.scribe_ = new Scribe(this);
};

Game.SQUARE_SIZE = 8;

Game.prototype.playerPos = function() {
  return new geom.Point(this.dude.x_, this.dude.y_);
};

Game.prototype.keyPressed = function(chr) {
  return this.keyDown(chr) == 1;
};

Game.prototype.keyDown = function(chr) {
  if (typeof(chr) == 'string') {
    return this.keyDownCounts_[chr.toUpperCase().charCodeAt(0)];
  } else {
    return this.keyDownCounts_[chr];
  }
};

Game.prototype.tickHandleInput_ = function(t) {
  $.each(this.keyDown_, bind(this, function(key, value) {
      if (this.keyDownCounts_[key]) {
        this.keyDownCounts_[key]++;
      } else {
        this.keyDownCounts_[key] = 1;
      }
  }));
  $.each(this.keyDownCounts_, bind(this, function(key, value) {
      if (!this.keyDown_[key]) {
        this.keyDownCounts_[key] = 0;
      }
  }));
  /*
  if (this.keyDownCounts_[37]) {  // left
    this.rope_.pushClockwise();
  }
  if (this.keyDownCounts_[39]) {  // right
    this.rope_.pushCounterClockwise();
  }
  if (this.keyDownCounts_[38]) {  // up
    this.rope_.shorten();
  }
  if (this.keyDownCounts_[40]) {  // down
    this.rope_.lengthen();
  }
  if (this.keyDownCounts_[32] == 1) {
    this.rope_.toggleAttached();
  }
  if (this.keyDownCounts_['A'.charCodeAt(0)] == 1) {
    this.rope_.switchEnd();
  }
  if (this.keyDownCounts_['X'.charCodeAt(0)] == 1) {
    var nx = this.rope_.x_ + 0.5 * this.rope_.length_ * Math.cos(this.rope_.theta_);
    var ny = this.rope_.y_ + 0.5 * this.rope_.length_ * Math.sin(this.rope_.theta_);
    this.rope_.bend(new geom.Point(nx, ny));
  }
  */
};

Game.prototype.setCheckpoint = function(trigger) {
  this.lastCheckpoint_ = trigger;
};

Game.prototype.respawn = function() {
  this.dude.x_ = this.lastCheckpoint_.x;
  this.dude.y_ = this.lastCheckpoint_.y - Game.SQUARE_SIZE;
  this.dude.energy.refill();
  this.renderer.centerCamera(this.dude.x_, this.dude.y_);
};

Game.prototype.tick = function(t) {
  this.tickHandleInput_(t);

  this.dude.tick(t);
  if (this.dude.energy.energy <= 0) {
    this.scribe_.addEvent(Scribe.BasicEvents.DIED);
    this.respawn();
    this.scribe_.startNewChain();
  }
  /*
  if (this.level_.collidesCircle(this.rope_.asLine().p2, 5)) {
    this.rope_.stabilize();
  }
  this.rope_.tick(t);

  var ropeLine = this.rope_.asLine();
  var collisionLines = [];
  var collide = this.level_.collidesLine(ropeLine, collisionLines);
  if (collide) {
    var wasAttached = this.rope_.setAttached(true);
    var len = collisionLines.length;
    if (len == 1) {
      var line = collisionLines[0];
      if (wasAttached) {
        this.rope_.stabilize();
        this.rope_.rv_ = 0;
        this.rope_.xv_ = 0;
        this.rope_.yv_ = 0;
      } else {
        this.rope_.switchEnd();
        // Push out the rope away from the wall it hit.
        var pointOn = line.projectPoint(ropeLine.p2, 5);
        this.rope_.x_ = pointOn.x;
        this.rope_.y_ = pointOn.y;
        this.rope_.rv_ = 0;
        this.rope_.xv_ = 0;
        this.rope_.yv_ = 0;
      }
    } else if (len == 2) {
      var l1n = collisionLines[0].normal();
      var l2n = collisionLines[1].normal();
      this.rope_.bend(collisionLines[0].p2.plus(l1n.plus(l2n).times(5)));
    } else {
      var d1 = new geom.Line(ropeLine.p1, collisionLines[0].p2).mag2();
      var d2 = new geom.Line(ropeLine.p1, collisionLines[len - 1].p1).mag2();
      if (d1 < d2) {
        this.rope_.bend(collisionLines[0].p2);
      } else {
        this.rope_.bend(collisionLines[len - 1].p1);
      }
    }
    window.console.log(collide, len);
  }
  */
};

Game.prototype.renderUiBackground = function(renderer) {
  this.dude.energy.render(renderer);
};

Game.prototype.renderUiForeground = function(renderer) {
  this.scribe_.render(renderer);
};

Game.prototype.render = function(renderer) {
  this.dude.render(renderer);
  if (this.level) {
    this.level.render(renderer);
  }
};

Game.prototype.onKeyDown = function(event) {
  this.keyDown_[event.keyCode] = true;
};

Game.prototype.onKeyUp = function(event) {
  this.keyDown_[event.keyCode] = false;
};

Game.prototype.setLevel = function(level) {
  this.level = level;
};

// +----------------------------------------------------------------------------
// | Scribe
function Scribe(game) {
  this.game_ = game;
  this.eventsChain_ = [[Scribe.BasicEvents.SPAWNED]];
};

Scribe.BasicEvents = {
  SPAWNED: 'Our Hero wakes.',
  DIED: 'Our Hero falls.'
};

Scribe.prototype.startNewChain = function(opt_event) {
  var evt = opt_event || Scribe.BasicEvents.SPAWNED;
  this.eventsChain_.push([evt]);
};

Scribe.prototype.addEvent = function(evt) {
  this.eventsChain_[this.eventsChain_.length - 1].push(evt);
};

Scribe.prototype.render = function(renderer) {
  renderer.context().font = 'bold 12px sans-serif';
  renderer.context().fillStyle = '#666';
  var first = true;
  for (var i = this.eventsChain_.length - 1; i >= 0; --i) {
    renderer.context().fillText(this.eventsChain_[i].join(' '), 0, (i + 1) * 16);
    if (first) {
      first = false;
      renderer.context().fillStyle = '#999';
    }
  }
};
