function Game(renderer) {
  this.renderer_ = renderer;
  this.cw_ = 0;
  this.ch_ = 0;
};

Game.prototype.tick = function() {
  this.cw_ += 2;
  this.ch_ += 2;
  if (this.cw_ > 2 * this.renderer_.width()) {
    this.cw_ = 0;
  }
  if (this.ch_ > 2 * this.renderer_.height()) {
    this.ch_ = 0;
  }
};

Game.prototype.render = function(renderer) {
  var context = renderer.context();
  var w = this.cw_;
  if (w > renderer.width()) {
    w = 2 * renderer.width() - w;
  }
  var h = this.ch_;
  if (h > renderer.height()) {
    h = 2 * renderer.height() - h;
  }
  context.fillRect(0, 0, w, h);
};
