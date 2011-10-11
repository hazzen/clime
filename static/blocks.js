// +----------------------------------------------------------------------------
// | Blocks
// +----------------------------------------------------------------------------

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
      this.x, this.y, Game.SQUARE_SIZE, Game.SQUARE_SIZE);
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
  this.solid = false;
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
  game.dude.energy.addSap(DudeEnergy.SapTypes.DRAINER);
};

// +----------------------------------------------------------------------------
// | Triggers
// +----------------------------------------------------------------------------

// +----------------------------------------------------------------------------
// | TriggerBlock (base class for triggers)
function TriggerBlock(x, y, color, opt_w, opt_h) {
  if (arguments.length == 0) return;
  SolidBlock.call(this, x, y, color, opt_w, opt_h);
  this.solid = false;
}

TriggerBlock.inherits(SolidBlock);

TriggerBlock.prototype.render = function(renderer) {}

// +----------------------------------------------------------------------------
// | CheckpointTrigger
function CheckpointTrigger(x, y, color, opt_w, opt_h) {
  if (arguments.length == 0) return;
  TriggerBlock.call(this, x, y, color, opt_w, opt_h);
  this.solid = false;
}

CheckpointTrigger.inherits(TriggerBlock);

CheckpointTrigger.prototype.playerTouched = function(game) {
  game.setCheckpoint(this);
  game.dude.energy.addSap(DudeEnergy.SapTypes.CHECKPOINT);
}

// +----------------------------------------------------------------------------
// | ScribeTrigger
function ScribeTrigger(x, y, color, opt_w, opt_h) {
  if (arguments.length == 0) return;
  TriggerBlock.call(this, x, y, color, opt_w, opt_h);
  this.solid = false;
  this.text = ScribeTrigger.EVENT_MAP[color.toCssString()];
}

ScribeTrigger.EVENT_MAP = {
  '#0000ff': 'Our Hero sees his village.'
};

ScribeTrigger.inherits(TriggerBlock);

ScribeTrigger.prototype.actorTouched = function(game, actor) {
  if (actor instanceof Dude) {
    game.scribe_.addEvent(this.text);
  }
}
