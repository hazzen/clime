function Renderer(canvasElem) {
  this.canvasElem_ = canvasElem;
  this.context_ = this.canvasElem_.getContext('2d');
  this.w_ = canvasElem.width;
  this.h_ = canvasElem.height;
  this.xOff_ = 0;
  this.yOff_ = 0;
  this.xOffVel_ = 0;
  this.yOffVel_ = 0;
}

Renderer.prototype.xOffset = function() {
  return this.xOff_;
};

Renderer.prototype.yOffset = function() {
  return this.yOff_;
};

Renderer.prototype.width = function() {
  return this.w_;
};

Renderer.prototype.height = function() {
  return this.h_;
};

Renderer.prototype.context = function() {
  return this.context_;
};

Renderer.prototype.render = function(game) {
  this.context_.clearRect(0, 0, this.w_, this.h_);
  this.context_.save();

  var accel = function(cur, target, vel) {
    if (Math.abs(cur - target) < 100) {
      if (vel > 0.5) {
        return -vel / 2;
      } else {
        return -vel;
      }
    } else if (vel < 3) {
      return sgn(target - cur) * 0.3;
    } else {
      return sgn(target - cur);
    }
  };
  var playerPos = game.playerPos();
  this.xOffVel_ += accel(this.xOff_ + this.w_ / 2, playerPos.x, this.xOffVel_);
  this.yOffVel_ += accel(this.yOff_ + this.h_ / 2, playerPos.y, this.yOffVel_);
  this.xOff_ += this.xOffVel_;
  this.yOff_ += this.yOffVel_;

  this.context_.translate(-this.xOff_, -this.yOff_);
  game.render(this);
  this.context_.restore();
};
