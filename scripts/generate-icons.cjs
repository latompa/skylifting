// Generate minimal PNG icons using pure Node.js
// Creates simple solid color square icons with dumbbell design

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // width
  ihdrData.writeUInt32BE(height, 4);  // height
  ihdrData.writeUInt8(8, 8);          // bit depth
  ihdrData.writeUInt8(2, 9);          // color type (RGB)
  ihdrData.writeUInt8(0, 10);         // compression
  ihdrData.writeUInt8(0, 11);         // filter
  ihdrData.writeUInt8(0, 12);         // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk - raw image data
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte for row
    for (let x = 0; x < width; x++) {
      // Normalized coordinates
      const nx = x / width;
      const ny = y / height;

      // Rounded corners check
      const cornerRadius = 0.125;
      const isInCorner = (
        (nx < cornerRadius && ny < cornerRadius && Math.hypot(nx - cornerRadius, ny - cornerRadius) > cornerRadius) ||
        (nx > 1 - cornerRadius && ny < cornerRadius && Math.hypot(nx - (1 - cornerRadius), ny - cornerRadius) > cornerRadius) ||
        (nx < cornerRadius && ny > 1 - cornerRadius && Math.hypot(nx - cornerRadius, ny - (1 - cornerRadius)) > cornerRadius) ||
        (nx > 1 - cornerRadius && ny > 1 - cornerRadius && Math.hypot(nx - (1 - cornerRadius), ny - (1 - cornerRadius)) > cornerRadius)
      );

      if (isInCorner) {
        // Outside rounded corner - white background
        rawData.push(255, 255, 255);
        continue;
      }

      // Draw a simple dumbbell icon
      // Barbell bar region
      const barYMin = 0.44, barYMax = 0.56;
      const barXMin = 0.22, barXMax = 0.78;

      // Left plate
      const leftPlateXMin = 0.12, leftPlateXMax = 0.24;
      const leftPlateYMin = 0.28, leftPlateYMax = 0.72;

      // Right plate
      const rightPlateXMin = 0.76, rightPlateXMax = 0.88;
      const rightPlateYMin = 0.28, rightPlateYMax = 0.72;

      const isBar = ny >= barYMin && ny <= barYMax && nx >= barXMin && nx <= barXMax;
      const isLeftPlate = nx >= leftPlateXMin && nx <= leftPlateXMax && ny >= leftPlateYMin && ny <= leftPlateYMax;
      const isRightPlate = nx >= rightPlateXMin && nx <= rightPlateXMax && ny >= rightPlateYMin && ny <= rightPlateYMax;

      if (isBar || isLeftPlate || isRightPlate) {
        rawData.push(255, 255, 255); // white icon
      } else {
        rawData.push(r, g, b); // background color
      }
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(data) {
  let crc = 0xffffffff;
  const table = makeCRCTable();
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCRCTable() {
  const table = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

// Generate icons with blue background (#3b82f6)
const r = 59, g = 130, b = 246;

const icon192 = createPNG(192, 192, r, g, b);
const icon512 = createPNG(512, 512, r, g, b);
const appleIcon = createPNG(180, 180, r, g, b);

const publicDir = path.join(__dirname, '../public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

console.log('Icons generated successfully!');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- apple-touch-icon.png');
