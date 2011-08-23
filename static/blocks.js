function SolidBlock(x, y, color, opt_w, opt_h) {
  this.x = x;
  this.y = y;
  this.w = opt_w || Game.SQUARE_SIZE;
  this.h = opt_h || Game.SQUARE_SIZE;
  this.color = color;
};

SolidBlock.prototype.render = function(renderer) {
  renderer.context().fillStyle = this.color;
  renderer.context().fillRect(
      this.x * Game.SQUARE_SIZE,
      this.y * Game.SQUARE_SIZE,
      Game.SQUARE_SIZE,
      Game.SQUARE_SIZE);
};

SolidBlock.prototype.pushBlocksInRect = function(rect, arr) {
  arr.push(this);
};

SolidBlock.prototype.tick = function(t) {
};
