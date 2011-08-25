function ByteReader(data) {
  this.data = data;
  this.index = 0;
}

ByteReader.prototype.readByte = function(opt_num) {
  var num = opt_num || 1;
  if (this.index + num > this.data.length) {
    return -1;
  }
  var read = 0;
  var mult = 1;
  for (; num > 0; --num) {
    read += mult * (this.data.charCodeAt(this.index++) & 0xff);
    mult *= 256;
  }
  return read;
};


function loadTga(path, done) {
  $.ajax({
    url: path,
    success: function(data) { parseTga(data, done); },
    beforeSend: function(xhr) {
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
    },
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
  // Bytes [19, o1=19 + id): Image info data (ignore)
  // Bytes [o1, o2=o1 + ceil(cm ln * cm sz / 8)): Color map (ignore)
  // Bytes [o2, o2 + ceil(im w * im h * im dp / 8)): Image data.
  var reader = new ByteReader(this.data_);
  var idLen = reader.readByte();
  var colorMapType = reader.readByte();
  var imageType = reader.readByte();

  // Ignore all the color map (assume we don't have one for now).
  reader.readByte(5);
  // Ignore the x/y offset.
  reader.readByte(4);
  this.width = reader.readByte(2);
  this.height = reader.readByte(2);
  // Ignore the pixel depth and the alpha info.
  reader.readByte(2);
  this.pixels = this.data_.substring(reader.index);
};

TgaImage.prototype.pixelAt = function(x, y) {
  x = Math.min(this.width - 1, Math.max(0, x));
  y = Math.min(this.height - 1, Math.max(0, y));
  var index = x + (this.height - y - 1) * this.width;
  var reader = new ByteReader(this.pixels.substring(4 * index, 4 * index + 4));
  var b = reader.readByte();
  var g = reader.readByte();
  var r = reader.readByte();
  var a = reader.readByte();
  return new Rgb(r, g, b, a);
};

function parseTga(data, done) {
  var tgaImg = new TgaImage(data);
  tgaImg.parse();
  done(tgaImg);
}
