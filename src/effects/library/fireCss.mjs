import { clamp01 } from '../modifiers.mjs';

function lerp(a, b, t){
  return a + (b - a) * t;
}

function mixColors(a, b, t){
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

function sampleGradient(stops, t){
  if (!stops.length) return [t, t, t];
  if (t <= stops[0].pos) return stops[0].color;
  for (let i = 0; i < stops.length - 1; i++){
    const a = stops[i];
    const b = stops[i + 1];
    if (t <= b.pos){
      const f = (t - a.pos) / Math.max(1e-6, b.pos - a.pos);
      return mixColors(a.color, b.color, f);
    }
  }
  return stops[stops.length - 1].color;
}

export const id = 'fireCss';
export const displayName = 'Fire CSS';
export const defaultParams = {
  speed: 0.3,
  angle: 0.0,
  colors: [
    { pos: 0.0, color: [0.0, 0.0, 0.0] },
    { pos: 0.3, color: [1.0, 0.0, 0.0] },
    { pos: 0.6, color: [1.0, 0.5, 0.0] },
    { pos: 1.0, color: [1.0, 1.0, 1.0] },
  ],
};
export const paramSchema = {
  speed: { type: 'number', min: 0, max: 5, step: 0.01, label: 'Speed' },
  angle: { type: 'number', min: -Math.PI, max: Math.PI, step: 0.01, label: 'Angle (rad)' },
  colors: { type: 'colorStops', label: 'Colors' },
};

export function render(sceneF32, W, H, t, params){
  const {
    speed = defaultParams.speed,
    angle = defaultParams.angle,
    colors = defaultParams.colors,
  } = params || {};

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const sortedStops = [...colors].sort((a, b) => a.pos - b.pos);

  const flameCount = 20;
  const centers = new Array(flameCount);
  const widths = new Array(flameCount);
  const flickers = new Array(flameCount);

  for (let f = 0; f < flameCount; f++){
    const base = (f + 0.5) / flameCount;
    centers[f] = base + 0.05 * Math.sin(f * 12.9898 + t * speed);
    widths[f] = 0.04 + 0.03 * Math.sin(f * 78.233 + t * speed * 0.5);
    flickers[f] = 0.6 + 0.4 * Math.sin(f * 34.567 + t * speed * 2);
  }

  const heatX = new Array(W).fill(0);
  for (let x = 0; x < W; x++){
    const u = x / W;
    let h = 0;
    for (let f = 0; f < flameCount; f++){
      const dx = Math.abs(u - centers[f]) / widths[f];
      const contrib = flickers[f] * clamp01(1 - dx * dx);
      if (contrib > h) h = contrib;
    }
    heatX[x] = h;
  }

  for (let y = 0; y < H; y++){
    for (let x = 0; x < W; x++){
      let u = x / W;
      let v = y / H;

      const cx = u - 0.5;
      const cy = v - 0.5;
      const rx = cx * cosA - cy * sinA;
      const ry = cx * sinA + cy * cosA;
      u = rx + 0.5;
      v = ry + 0.5;

      const xi = Math.min(W - 1, Math.max(0, Math.floor(u * W)));
      const heat = heatX[xi] * (1 - v);
      const rgb = sampleGradient(sortedStops, clamp01(heat));

      const i = (y * W + x) * 3;
      sceneF32[i] = rgb[0];
      sceneF32[i + 1] = rgb[1];
      sceneF32[i + 2] = rgb[2];
    }
  }
}

