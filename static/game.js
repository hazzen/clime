function Game(renderer) {
  this.rope_ = new Rope(this, 300, 0, 50);
  this.keyDown_ = {};
  this.keyDownCounts_ = {};
  this.level_ = null;
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
};

Game.prototype.tick = function(t) {
  this.tickHandleInput_(t);

  var ropeLinePre = this.rope_.asLine();
  this.rope_.tick(t);

  var ropeLine = this.rope_.asLine();
  var p1Collide = this.level_.collidesCircle(ropeLine.p1, 5);
  var p2Collide = this.level_.collidesCircle(ropeLine.p2, 3);
  if (p1Collide || p2Collide) {
    this.rope_.rv_ = 0;
    this.rope_.xv_ = 0;
    this.rope_.yv_ = 0;
    window.console.log(p1Collide, p2Collide);
  } else {
    var preCollide = this.level_.collidesLine(ropeLinePre);
    var postCollide = this.level_.collidesLine(ropeLine);
    if (preCollide || postCollide) {
      window.console.log(preCollide, postCollide);
    }
  }
};

Game.prototype.render = function(renderer) {
  this.rope_.render(renderer);
};

Game.prototype.keyDown = function(event) {
  this.keyDown_[event.keyCode] = true;
};

Game.prototype.keyUp = function(event) {
  this.keyDown_[event.keyCode] = false;
};

Game.prototype.setLevel = function(level) {
  this.level_ = level;
};
