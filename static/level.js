function Level(game, imgPath) {
  this.game_ = game;
  this.imgPath_ = imgPath;
  this.coordToBlock_ = {};
};

Level.prototype.load = function(done) {
  loadTga(this.imgPath_, bind(this, this.loadDone_, done));
};

Level.prototype.loadDone_ = function(done, img) {
  this.img_ = img;

  for (var x = 0; x < this.img_.width; ++x) {
    for (var y = 0; y < this.img_.height; ++y) {
      var c = this.img_.pixelAt(x, y);
      var s = c.r + c.g + c.b;
      if (s < 3 * 255) {
        var block = new SolidBlock(x, y, c.toCssString());
        this.coordToBlock_['x' + x + 'y' + y] = block;
      }
    }
  }

  done();
};

Level.prototype.render = function(renderer) {
  $.each(this.coordToBlock_, bind(this, function(key, value) {
    value.render(renderer);
  }));
};

Level.prototype.blockAtPixel = function(x, y) {
  var sx = Math.floor(x / Game.SQUARE_SIZE);
  var sy = Math.floor(y / Game.SQUARE_SIZE);
  return this.coordToBlock_['x' + sx + 'y' + sy];
};

Level.prototype.pushBlocksInRect = function(rect, arr) {
  var dy = Math.ceil((rect.p2.y - rect.p1.y) / Game.SQUARE_SIZE);
  for (var y = rect.p1.y; dy > 0; --dy, y += Game.SQUARE_SIZE) {
    var dx = Math.ceil((rect.p2.x - rect.p1.x) / Game.SQUARE_SIZE);
    for (var x = rect.p1.x; dx > 0; --dx, x += Game.SQUARE_SIZE) {
      var block = this.blockAtPixel(x, y);
      if (block) {
        block.pushBlocksInRect(rect, arr);
      }
    }
  }
};

Level.QUADRANTS = {};
Level.QUADRANTS.UL = 0;
Level.QUADRANTS.UC = 1;
Level.QUADRANTS.UR = 2;
Level.QUADRANTS.ML = 3;
Level.QUADRANTS.MC = 4;
Level.QUADRANTS.MR = 5;
Level.QUADRANTS.LL = 6;
Level.QUADRANTS.LC = 7;
Level.QUADRANTS.LR = 8;

Level.prototype.blocksInQuadrants = function(rect, ox, oy) {
  ox = ox || 1;
  oy = oy || 1;
  var quads = [[],[],[],[],[],[],[],[],[]];
  var w = rect.p2.x - rect.p1.x;
  var h = rect.p2.y - rect.p1.y;
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x - ox, rect.p1.y - oy, ox, oy),
      quads[Level.QUADRANTS.UL]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x, rect.p1.y - oy, w, oy),
      quads[Level.QUADRANTS.UC]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p2.x, rect.p1.y - oy, ox, oy),
      quads[Level.QUADRANTS.UR]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x - ox, rect.p1.y, ox, h),
      quads[Level.QUADRANTS.ML]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x, rect.p1.y, w, h),
      quads[Level.QUADRANTS.MC]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p2.x, rect.p1.y, ox, h),
      quads[Level.QUADRANTS.MR]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x - ox, rect.p2.y, ox, oy),
      quads[Level.QUADRANTS.LL]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x, rect.p2.y, w, oy),
      quads[Level.QUADRANTS.LC]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p2.x, rect.p2.y, ox, oy),
      quads[Level.QUADRANTS.LR]);
  return quads;
};
