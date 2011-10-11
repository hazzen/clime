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

Renderer.prototype.centerCamera = function(x, y) {
  this.xOff_ = x - this.w_ / 2;
  this.yOff_ = y - this.h_ / 2;
  this.xOffVel_ = 0;
  this.yOffVel_ = 0;
};

Renderer.prototype.wrapTextToLines = function(text) {
  var ALLOWANCE = 50;
  var supposedWidth = this.context_.measureText(text).width;
  if (supposedWidth < this.w_) {
    return [text];
  }
  var arr = [];
  var curIndex = 0;
  for (;;) {
    var nextSpace = text.indexOf(' ', curIndex);
    if (nextSpace == -1) {
      arr.push(text);
      return arr;
    }
    var subText = text.substring(0, nextSpace);
    var subWidth = this.context_.measureText(subText).width;
    if (subWidth < this.w_ && ALLOWANCE + subWidth > this.w_) {
      arr.push(subText);
      curIndex = 0;
      text = text.substring(nextSpace + 1);
    } else {
      curIndex = nextSpace + 1;
    }
  }
};

Renderer.prototype.render = function(game) {
  this.context_.clearRect(0, 0, this.w_, this.h_);
  // Render the background UI
  game.renderUiBackground(this);

  // Track viewport
  this.context_.save();

  var accel = function(cur, target, vel) {
    if (Math.abs(cur - target) < 50) {
      if (vel > 0.5) {
        return -vel * 0.05;
      } else {
        return -vel;
      }
    } else if (vel < 10) {
      return sgn(target - cur) * 0.3;
    } else {
      return sgn(target - cur) * 1.7;
    }
  };
  var playerPos = game.playerPos();
  this.xOffVel_ += accel(this.xOff_ + this.w_ / 2, playerPos.x, this.xOffVel_);
  this.yOffVel_ += accel(this.yOff_ + this.h_ / 2, playerPos.y, this.yOffVel_);
  this.xOff_ += this.xOffVel_;
  this.yOff_ += this.yOffVel_;

  // Render game
  this.context_.translate(-Math.round(this.xOff_) + 0.5,
                          -Math.round(this.yOff_) + 0.5);
  game.render(this);
  this.context_.restore();

  // Render the foreground UI
  game.renderUiForeground(this);
};
