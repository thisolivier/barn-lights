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
  flames: 3,
  colors: [
    { pos: 0.0, color: [0.0, 0.0, 0.0] },
    { pos: 0.3, color: [1.0, 0.0, 0.0] },
    { pos: 0.6, color: [1.0, 0.5, 0.0] },
    { pos: 1.0, color: [1.0, 1.0, 1.0] },
  ],
};
export const paramSchema = {
  angle: { type: 'number', min: -Math.PI, max: Math.PI, step: 0.01, label: 'Angle (rad)' },
  flames: { type: 'number', min: 1, max: 20, step: 1, label: 'Flames' },
  colors: { type: 'colorStops', label: 'Colors' },
};

export function render(sceneF32, W, H, t, params){
  const {
    angle = defaultParams.angle,
    flames = defaultParams.flames,
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

      let heat = 0;
      for (let f = 0; f < flames; f++){
        const fx = (f + 0.5) / flames;
        const phase = (t + f / flames) % 1;
        const fy = 1 - phase;
        const size = 0.15;
        const dx = u - fx;
        const dy = v - fy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const intensity = clamp01(1 - dist / size) * clamp01(1 - phase);
        if (intensity > heat) heat = intensity;
      }

      const rgb = sampleGradient(sortedStops, heat);
      const i = (y * W + x) * 3;
      sceneF32[i] = rgb[0];
      sceneF32[i + 1] = rgb[1];
      sceneF32[i + 2] = rgb[2];
    }
  }
}
