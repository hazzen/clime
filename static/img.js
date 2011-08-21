
function loadTga(path, done) {
  $.ajax({
    url: path,
    success: function(data) { parseTga(data, done); },
    dataType: 'text'
  });
}

function TgaImage(data) {
  this.data_ = data;
}

TgaImage.prototype.parse = function() {
  // TGA format:
  // Header (18 bytes)
  // [  id  ][  cm  ][  it  ][    cm off    ][    cm ln     ][ cm sz]
  // [    im xo     ][     im yo    ][     im w     ][     im h     ]
  // [ im dp][ im de]
  //
  // id: number of bytes in the id tag
  // cm: 1 if there is a color map
  // it: image type:
  //     it % 8 == 1: color mapped
  //            == 2: true color
  //            == 3: black and white
  //     (it / 8) % 8 == 0: uncompressed
  //                  == 1: run-length encoded
  // (ignoring all "cm" fields)
  // im xo: x-origin for lower-left corner
  // im yo: y-origin for lower-left corner
  // im w : width in pixels
  // im h : height in pixels
  // im dp: pixel depth
  // im de: alpha info
  //
  // Bytes [19, o1=19 + id): Image data (ignore)
  // Bytes [o1, o2=o1 + ceil(cm ln * cm sz / 8)): Color map (ignore)
  // Bytes [o2, o2 + ceil(im w * im h * im dp / 8)): Image data.
  var self = this;
  var index = 0;
  function readByte(opt_num) {
    var num = opt_num || 1;
    if (index + num > self.data_.length) {
      return -1;
    }
    var read = 0;
    var mult = 1;
    for (; num > 0; --num) {
      read += mult * (self.data_.charCodeAt(index++) & 0xff);
      mult *= 255;
    }
    return read;
  }
  var idLen = readByte();
  var colorMapType = readByte();
  var imageType = readByte();

  // Ignore all the color map (assume we don't have one for now).
  readByte(5);
  // Ignore the x/y offset.
  readByte(4);
  this.width = readByte(2);
  this.height = readByte(2);
  // Ignore the pixel depth and the alpha info.
  readByte(2);
  this.pixels = this.data_.substring(index);
};

TgaImage.prototype.pixelAt = function(x, y) {
  x = Math.min(this.width - 1, Math.max(0, x));
  y = Math.min(this.height - 1, Math.max(0, y));
  var index = x + (this.height - y - 1) * this.width;
  return this.pixels.substring(index, index + 4);
};

function parseTga(data, done) {
  var tgaImg = new TgaImage(data);
  tgaImg.parse();
  done(tgaImg);
}
