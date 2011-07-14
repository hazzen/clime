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

Game.prototype.render = function() {
  var context = this.renderer_.context();
  var w = this.cw_;
  if (w > this.renderer_.width()) {
    w = 2 * this.renderer_.width() - w;
  }
  var h = this.ch_;
  if (h > this.renderer_.height()) {
    h = 2 * this.renderer_.height() - h;
  }
  context.fillRect(0, 0, w, h);
};
