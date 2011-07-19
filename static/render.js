function Renderer(canvasElem) {
  this.canvasElem_ = canvasElem;
  this.context_ = this.canvasElem_.getContext('2d');
  this.w_ = canvasElem.width;
  this.h_ = canvasElem.height;
  this.xOff_ = 0;
  this.yOff_ = 0;
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

Renderer.prototype.render = function() {
  this.context_.clearRect(0, 0, this.w_, this.h_);
};
