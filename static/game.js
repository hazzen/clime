function Game(renderer) {
  this.rope_ = new Rope(this, 300, 0, 50);
  this.keyDown_ = {};
  this.keyDownCounts_ = {};
};

Game.prototype.tick = function(t) {
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
    this.rope_.force(-1);
  }
  if (this.keyDownCounts_[39]) {  // right
    this.rope_.force( 1);
  }
  if (this.keyDownCounts_[32] == 1) {
    this.rope_.toggleAttached();
  }
  if (this.keyDownCounts_['A'.charCodeAt(0)] == 1) {
    this.rope_.switchEnd();
  }
  this.rope_.tick(t);
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
