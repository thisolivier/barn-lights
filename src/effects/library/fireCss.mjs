// Fire effect inspired by a CSS particle animation.
// The number of flames mirrors the number of rising particles in the CSS version.

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
  angle: 0.0,
  numFlames: 50,
  colors: [
    { pos: 0.0, color: [0.0, 0.0, 0.0] },
    { pos: 0.3, color: [1.0, 0.0, 0.0] },
    { pos: 0.6, color: [1.0, 0.5, 0.0] },
    { pos: 1.0, color: [1.0, 1.0, 1.0] },
  ],
};
export const paramSchema = {
  angle: { type: 'number', min: -Math.PI, max: Math.PI, step: 0.01, label: 'Angle (rad)' },
  numFlames: { type: 'number', min: 1, max: 50, step: 1, label: 'Number of Flames' },
  colors: { type: 'colorStops', label: 'Colors' },
};

export function render(sceneF32, W, H, t, params){
  const {
    angle = defaultParams.angle,
    numFlames = defaultParams.numFlames,
    colors = defaultParams.colors,
  } = params || {};

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const sortedStops = [...colors].sort((a, b) => a.pos - b.pos);

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

      const height = clamp01(1 - v);
      let heat = 0;
      for (let i = 0; i < numFlames; i++){
        const center = (i + 0.5) / numFlames;
        const width = 1 / numFlames;
        const dx = Math.abs(u - center);
        const flame = Math.max(0, 1 - dx / width);
        const flicker = 0.5 + 0.5 * Math.sin(t * 2 + i * 10 + v * 5);
        heat = Math.max(heat, flame * height * flicker);
      }

      heat = clamp01(heat);
      const rgb = sampleGradient(sortedStops, heat);

      const idx = (y * W + x) * 3;
      sceneF32[idx] = rgb[0];
      sceneF32[idx + 1] = rgb[1];
      sceneF32[idx + 2] = rgb[2];
    }
  }
}
