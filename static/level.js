function Level(game, imgPath) {
  this.game_ = game;
  this.imgPath_ = imgPath;
  this.coordToBlock_ = {};
};

Level.createTriggerBlock_ = function(c) {
  if (c.r == 255 && c.g + c.b == 0) {
    return CheckpointTrigger;
  }
  return null;
};

Level.simpleBlocks_ = {
  255: function() { return SolidBlock; },
  254: function() { return TrapBlock; },
  253: function() { return DrainingBlock; },
  250: Level.createTriggerBlock_
};

Level.prototype.load = function(done) {
  loadTga(this.imgPath_, bind(this, this.loadDone_, done));
};

Level.prototype.coordsForBlock_ = function(b) {
  var sx = Math.floor(b.x / Game.SQUARE_SIZE);
  var sy = Math.floor(b.y / Game.SQUARE_SIZE);
  return 'x' + sx + 'y' + sy;
};

Level.prototype.coordsForPixel_ = function(x, y) {
  var sx = Math.floor(x / Game.SQUARE_SIZE);
  var sy = Math.floor(y / Game.SQUARE_SIZE);
  return 'x' + sx + 'y' + sy;
};

Level.prototype.loadDone_ = function(done, img) {
  this.img_ = img;

  for (var x = 0; x < this.img_.width; ++x) {
    for (var y = 0; y < this.img_.height; ++y) {
      var c = this.img_.pixelAt(x, y);
      var s = c.r + c.g + c.b;
      if (s < 3 * 255) {
        var ctorFunc = Level.simpleBlocks_[c.a];
        if (ctorFunc) {
          var block = new (ctorFunc(c))(
              x * Game.SQUARE_SIZE, y * Game.SQUARE_SIZE, c);
          this.coordToBlock_['x' + x + 'y' + y] = block;
        }
      }
    }
  }

  done();
};

Level.prototype.eraseBlock = function(b) {
  delete this.coordToBlock_[this.coordsForBlock_(b)];
};

Level.prototype.setBlock = function(b) {
  this.coordToBlock_[this.coordToBlock_(b)] = b;
};

Level.prototype.render = function(renderer) {
  $.each(this.coordToBlock_, bind(this, function(key, value) {
    value.render(renderer);
  }));
};

Level.prototype.blockAtPixel = function(x, y) {
  return this.coordToBlock_[this.coordsForPixel_(x, y)];
};

Level.prototype.pushBlocksInRect = function(rect, arr) {
  if (rect.p1.x == rect.p2.x || rect.p1.y == rect.p2.y) {
    return;
  }
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

Level.QUADRANTS.VERTICAL = [
  Level.QUADRANTS.UL,
  Level.QUADRANTS.UC,
  Level.QUADRANTS.UR,
  Level.QUADRANTS.LL,
  Level.QUADRANTS.LC,
  Level.QUADRANTS.LR
];
Level.QUADRANTS.HORIZONTAL = [
  Level.QUADRANTS.UL,
  Level.QUADRANTS.UR,
  Level.QUADRANTS.ML,
  Level.QUADRANTS.MR,
  Level.QUADRANTS.LL,
  Level.QUADRANTS.LR
];

Level.prototype.blocksInQuadrants = function(rect, outerRect) {
  var quads = [[],[],[],[],[],[],[],[],[]];
  var w = rect.p2.x - rect.p1.x;
  var h = rect.p2.y - rect.p1.y;
  var p1d = rect.p1.minus(outerRect.p1);
  var p2d = outerRect.p2.minus(rect.p2);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x - p1d.x, rect.p1.y - p1d.y, p1d.x, p1d.y),
      quads[Level.QUADRANTS.UL]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x, rect.p1.y - p1d.y, w, p1d.y),
      quads[Level.QUADRANTS.UC]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p2.x, rect.p1.y - p1d.y, p2d.x, p1d.y),
      quads[Level.QUADRANTS.UR]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x - p1d.x, rect.p1.y, p1d.x, h),
      quads[Level.QUADRANTS.ML]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x, rect.p1.y, w, h),
      quads[Level.QUADRANTS.MC]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p2.x, rect.p1.y, p2d.x, h),
      quads[Level.QUADRANTS.MR]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x - p1d.x, rect.p2.y, p1d.x, p2d.y),
      quads[Level.QUADRANTS.LL]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p1.x, rect.p2.y, w, p2d.y),
      quads[Level.QUADRANTS.LC]);
  this.pushBlocksInRect(
      new geom.AABB(rect.p2.x, rect.p2.y, p2d.x, p2d.y),
      quads[Level.QUADRANTS.LR]);
  return quads;
};
