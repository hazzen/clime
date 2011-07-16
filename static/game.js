function Game(renderer) {
  this.rope_ = new Rope(this, 300, 0, 200);
  this.keyDown_ = {};
};

Game.prototype.tick = function() {
  if (this.keyDown_[37]) {  // left
    this.rope_.force(-0.01);
  }
  if (this.keyDown_[39]) {  // right
    this.rope_.force( 0.01);
  }
  this.rope_.tick();
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
