const fs = require('fs');
const path = require('path');

const assetsDir = 'c:/Users/dhana/projects/Clinic/website/assets';
const files = fs.readdirSync(assetsDir);

function getWebPDimensions(buffer) {
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || webp !== 'WEBP') return null;

  const type = buffer.toString('ascii', 12, 16);
  if (type === 'VP8X') {
    // Width: 24-bit at 24, Height: 24-bit at 27 (Wait, let's verify offset from standard VP8X specification:
    // chunk size is 10, offset 8 is size, offset 12 is VP8X, offset 20 is flags (1 byte), offset 21-23 is width (3 bytes) - 1, offset 24-26 is height (3 bytes) - 1.
    // Let's check:
    const w = buffer.readUIntLE(21, 3) + 1;
    const h = buffer.readUIntLE(24, 3) + 1;
    return { width: w, height: h, sub: 'VP8X' };
  } else if (type === 'VP8L') {
    // Lossless. Signature is 0x2f at byte 20.
    if (buffer[20] !== 0x2f) return null;
    const b1 = buffer[21];
    const b2 = buffer[22];
    const b3 = buffer[23];
    const b4 = buffer[24];
    // width: 14 bits, height: 14 bits
    const w = 1 + (((b2 & 0x3f) << 8) | b1);
    const h = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
    return { width: w, height: h, sub: 'VP8L' };
  } else if (type === 'VP8 ') {
    // Lossy. Start code is 0x9d012a at byte 23.
    const w = buffer.readUInt16LE(26) & 0x3fff;
    const h = buffer.readUInt16LE(28) & 0x3fff;
    return { width: w, height: h, sub: 'VP8 ' };
  }
  return null;
}

function getJpegDimensions(buffer) {
  // Check SOI marker
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    const marker = buffer.readUInt16BE(offset);
    offset += 2;
    if (marker === 0xffd9 || marker === 0xffda) { // EOI or SOS
      break;
    }
    const size = buffer.readUInt16BE(offset);
    if (marker >= 0xffc0 && marker <= 0xffc3) { // SOF0, SOF1, SOF2
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height };
    }
    offset += size;
  }
  return null;
}

files.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  const filePath = path.join(assetsDir, file);
  const buffer = fs.readFileSync(filePath);

  if (buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    console.log(`${file} (PNG): ${width}x${height}`);
  } else {
    // Check if WebP
    const webpDim = getWebPDimensions(buffer);
    if (webpDim) {
      console.log(`${file} (WEBP - ${webpDim.sub}): ${webpDim.width}x${webpDim.height}`);
    } else {
      // Check if JPEG
      const jpegDim = getJpegDimensions(buffer);
      if (jpegDim) {
        console.log(`${file} (JPEG): ${jpegDim.width}x${jpegDim.height}`);
      } else {
        console.log(`${file}: Unknown format`);
      }
    }
  }
});
