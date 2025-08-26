let frames = [];
let frameW = 1;
let frameH = 1;
let frameDelays = [];
let totalDuration = 1;
let cumulativeDelays = [];

async function loadGif(){
  if (typeof window !== 'undefined') return; // skip in browser preview
  try {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    const gifuct = await import('gifuct-js');
    const { parseGIF, decompressFrames } = gifuct.default || gifuct;
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const ROOT = path.resolve(__dirname, '../../..');
    const buf = await fs.promises.readFile(path.join(ROOT, 'giphy.gif'));
    const gif = parseGIF(buf);
    frameW = gif.lsd.width;
    frameH = gif.lsd.height;
    const rawFrames = decompressFrames(gif, true);
    frames = rawFrames.map(f => f.patch);
    frameDelays = rawFrames.map(f => (f.delay || 10) / 100);
    totalDuration = frameDelays.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    cumulativeDelays = frameDelays.map(d => (acc += d));
  } catch (err) {
    console.error('Failed to load gif', err);
  }
}

await loadGif();

function frameAt(time) {
  const mod = time % totalDuration;
  for (let i = 0; i < cumulativeDelays.length; i++) {
    if (mod < cumulativeDelays[i]) return i;
  }
  return 0;
}

// color helpers
function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    case 5: return [v, p, q];
  }
}

export const id = 'fire';
export const displayName = 'Fire';
export const defaultParams = {
  speed: 1.0,
  angle: 0.0,
  scale: 1.0,
  hue: 0.0,
  saturation: 1.0,
};
export const paramSchema = {
  speed: { type: 'number', min: 0, max: 5, step: 0.01, label: 'Speed' },
  angle: { type: 'number', min: -Math.PI, max: Math.PI, step: 0.01, label: 'Angle (rad)' },
  scale: { type: 'number', min: 0.1, max: 5, step: 0.01, label: 'Scale' },
  hue: { type: 'number', min: -180, max: 180, step: 1, label: 'Hue Shift (deg)' },
  saturation: { type: 'number', min: 0, max: 2, step: 0.01, label: 'Saturation' },
};

export function render(sceneF32, W, H, t, params) {
  if (!frames.length) return;
  const {
    speed = defaultParams.speed,
    angle = defaultParams.angle,
    scale = defaultParams.scale,
    hue = defaultParams.hue,
    saturation = defaultParams.saturation,
  } = params || {};

  const frame = frames[frameAt(t * speed)];
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const hueShift = hue / 360;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W - 0.5;
      const ny = y / H - 0.5;
      let u = (nx * cosA - ny * sinA) / scale + 0.5;
      let v = (nx * sinA + ny * cosA) / scale + 0.5;
      u = ((u % 1) + 1) % 1;
      v = ((v % 1) + 1) % 1;
      const sx = Math.floor(u * frameW);
      const sy = Math.floor(v * frameH);
      const idx = (sy * frameW + sx) * 4;
      let r = frame[idx] / 255;
      let g = frame[idx + 1] / 255;
      let b = frame[idx + 2] / 255;
      let [h, s, val] = rgbToHsv(r, g, b);
      h = (h + hueShift + 1) % 1;
      s = Math.min(1, Math.max(0, s * saturation));
      [r, g, b] = hsvToRgb(h, s, val);
      const i = (y * W + x) * 3;
      sceneF32[i] = r;
      sceneF32[i + 1] = g;
      sceneF32[i + 2] = b;
    }
  }
}

