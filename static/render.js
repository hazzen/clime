function Renderer(canvasElem) {
  this.canvasElem_ = canvasElem;
  this.context_ = this.canvasElem_.getContext('2d');
  this.w_ = canvasElem.width;
  this.h_ = canvasElem.height;
}

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
