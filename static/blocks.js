// +----------------------------------------------------------------------------
// | SolidBlock (also the base class of all blocks)
function SolidBlock(x, y, color, opt_w, opt_h) {
  if (arguments.length == 0) return;
  this.x = x;
  this.y = y;
  this.w = opt_w || Game.SQUARE_SIZE;
  this.h = opt_h || Game.SQUARE_SIZE;
  this.color = color.toCssString();
  this.solid = true;
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

SolidBlock.prototype.playerTouched = function(game) {
};

// +----------------------------------------------------------------------------
// | TrapBlock
function TrapBlock(x, y, color, opt_w, opt_h) {
  if (arguments.length == 0) return;
  SolidBlock.call(this, x, y, color, opt_w, opt_h);
};

TrapBlock.inherits(SolidBlock);

TrapBlock.prototype.playerTouched = function(game) {
  game.level.eraseBlock(this);
};

// +----------------------------------------------------------------------------
// | DrainingBlock
function DrainingBlock(x, y, color, opt_w, opt_h) {
  if (arguments.length == 0) return;
  SolidBlock.call(this, x, y, color, opt_w, opt_h);
  this.solid = false;
  color.a = 128;
  this.color = color.toRgbString();
}

DrainingBlock.inherits(SolidBlock);

DrainingBlock.prototype.playerTouched = function(game) {
};
