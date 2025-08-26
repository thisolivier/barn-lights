import { clamp01 } from '../modifiers.mjs';

let FRAME_W = 1;
let FRAME_H = 1;
let FRAMES = [];
let loadingPromise = null;

async function loadGif(){
  let buffer, parseGIF, decompressFrames;
  if (typeof window === 'undefined'){
    ({ parseGIF, decompressFrames } = await import('gifuct-js'));
    const fs = await import('fs/promises');
    const path = await import('path');
    const url = await import('url');
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const ROOT = path.resolve(__dirname, '../../..');
    const GIF_PATH = path.join(ROOT, 'giphy.gif');
    buffer = await fs.readFile(GIF_PATH);
  } else {
    ({ parseGIF, decompressFrames } = await import('/gifuct-esm.js'));
    const res = await fetch('/giphy.gif');
    buffer = new Uint8Array(await res.arrayBuffer());
  }
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);
  FRAME_W = gif.lsd.width;
  FRAME_H = gif.lsd.height;
  FRAMES = frames.map(f => {
    const patch = f.patch;
    const arr = new Float32Array(FRAME_W * FRAME_H * 3);
    for (let i = 0, j = 0; i < patch.length; i += 4, j += 3) {
      arr[j] = patch[i] / 255;
      arr[j + 1] = patch[i + 1] / 255;
      arr[j + 2] = patch[i + 2] / 255;
    }
    return arr;
  });
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) return [l, l, l];
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1 / 3)
  ];
}

export const id = 'fire';
export const displayName = 'Fire';
export const defaultParams = {
  speed: 1.0,
  angle: 0.0,
  scale: 1.0,
  hueShift: 0.0,
  saturation: 1.0,
};
export const paramSchema = {
  speed:      { type: 'number', min: 0, max: 5, step: 0.01, label: 'Speed' },
  angle:      { type: 'number', min: -Math.PI, max: Math.PI, step: 0.01, label: 'Angle (rad)' },
  scale:      { type: 'number', min: 0.1, max: 10, step: 0.01, label: 'Scale' },
  hueShift:   { type: 'number', min: -1, max: 1, step: 0.01, label: 'Hue Shift' },
  saturation: { type: 'number', min: 0, max: 2, step: 0.01, label: 'Saturation' },
};

export function render(sceneF32, W, H, t, params) {
  const { speed = 1, angle = 0, scale = 1, hueShift = 0, saturation = 1 } = params || {};
  if (!FRAMES.length) {
    if (!loadingPromise) loadingPromise = loadGif().catch(() => {});
    return;
  }

  const frameIndex = Math.floor((t * speed * FRAMES.length)) % FRAMES.length;
  const frame = FRAMES[frameIndex];

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cx = (x - W / 2) / scale;
      const cy = (y - H / 2) / scale;
      let u = cx * cosA - cy * sinA + FRAME_W / 2;
      let v = cx * sinA + cy * cosA + FRAME_H / 2;

      u = ((u % FRAME_W) + FRAME_W) % FRAME_W;
      v = ((v % FRAME_H) + FRAME_H) % FRAME_H;

      const ix = Math.floor(u);
      const iy = Math.floor(v);
      const fi = (iy * FRAME_W + ix) * 3;

      let r = frame[fi];
      let g = frame[fi + 1];
      let b = frame[fi + 2];
      let [h, s, l] = rgbToHsl(r, g, b);
      h = (h + hueShift) % 1;
      if (h < 0) h += 1;
      s = clamp01(s * saturation);
      [r, g, b] = hslToRgb(h, s, l);

      const i = (y * W + x) * 3;
      sceneF32[i] = r;
      sceneF32[i + 1] = g;
      sceneF32[i + 2] = b;
    }
  }
}
