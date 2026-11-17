import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src512 = path.join(root, 'apps/staff/pwa-assets/pwa-512x512.png');
const src48 = path.join(root, 'sales-android/app/src/main/res/mipmap-mdpi/ic_launcher.png');
const src96 = path.join(root, 'sales-android/app/src/main/res/mipmap-xhdpi/ic_launcher.png');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function decodeRgbaPng(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width = 0;
  let height = 0;
  const idats = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.subarray(pos + 4, pos + 8).toString('ascii');
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) {
        throw new Error(`Expected 8-bit RGBA PNG at ${filePath}`);
      }
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const stride = width * 4;
  const out = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
  };
  for (let y = 0; y < height; y++) {
    const rowIn = y * (stride + 1);
    const filter = raw[rowIn];
    const rowOut = y * stride;
    for (let x = 0; x < stride; x++) {
      const val = raw[rowIn + 1 + x];
      const a = x >= 4 ? out[rowOut + x - 4] : 0;
      const b = y > 0 ? out[rowOut - stride + x] : 0;
      const c = (x >= 4 && y > 0) ? out[rowOut - stride + x - 4] : 0;
      if (filter === 0) out[rowOut + x] = val;
      else if (filter === 1) out[rowOut + x] = (val + a) & 0xff;
      else if (filter === 2) out[rowOut + x] = (val + b) & 0xff;
      else if (filter === 3) out[rowOut + x] = (val + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) out[rowOut + x] = (val + paeth(a, b, c)) & 0xff;
      else throw new Error(`Unsupported PNG filter ${filter}`);
    }
  }
  return { width, height, rgba: out };
}

function encodeRgbaPng(width, height, rgba) {
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0;
    rgba.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = zlib.deflateSync(filtered, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function downsample2x(src) {
  const w = Math.floor(src.width / 2);
  const h = Math.floor(src.height / 2);
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i00 = ((y * 2) * src.width + (x * 2)) * 4;
      const i10 = ((y * 2) * src.width + (x * 2 + 1)) * 4;
      const i01 = ((y * 2 + 1) * src.width + (x * 2)) * 4;
      const i11 = ((y * 2 + 1) * src.width + (x * 2 + 1)) * 4;
      const o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        out[o + c] = Math.round((src.rgba[i00 + c] + src.rgba[i10 + c] + src.rgba[i01 + c] + src.rgba[i11 + c]) / 4);
      }
    }
  }
  return { width: w, height: h, rgba: out };
}

function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  for (let i = 0; i < entries.length; i++) {
    const { size, data } = entries[i];
    const base = i * 16;
    dir[base] = size >= 256 ? 0 : size;
    dir[base + 1] = size >= 256 ? 0 : size;
    dir[base + 2] = 0;
    dir[base + 3] = 0;
    dir.writeUInt16LE(1, base + 4);
    dir.writeUInt16LE(32, base + 6);
    dir.writeUInt32LE(data.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += data.length;
  }
  return Buffer.concat([header, dir, ...entries.map(e => e.data)]);
}

const decoded512 = decodeRgbaPng(src512);
const down256 = downsample2x(decoded512);
const png256 = encodeRgbaPng(down256.width, down256.height, down256.rgba);
const png96 = fs.readFileSync(src96);
const png48 = fs.readFileSync(src48);
const ico = buildIco([
  { size: 48, data: png48 },
  { size: 96, data: png96 },
  { size: 256, data: png256 },
]);

for (const target of ['admin-panel/resources', 'callcenter-desktop/resources']) {
  const dir = path.join(root, target);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'icon.ico'), ico);
  fs.copyFileSync(src512, path.join(dir, 'icon.png'));
  console.log(`Generated ${target}/icon.ico (${ico.length} bytes) and icon.png`);
}
