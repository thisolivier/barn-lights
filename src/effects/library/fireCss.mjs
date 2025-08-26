import { clamp01 } from '../modifiers.mjs';

// CSS-inspired fire effect using animated radial particles.
// Derived from the following SCSS snippet:
// $fireColor: rgb(255,80,0);
// $dur: 1s;
// $parts: 50;
// $partSize: 5em; // relative to container height

const FIRE_COLOR = [1, 80/255, 0];
const PARTS = 50; // number of particles per flame
const DUR = 1.0;  // seconds

function rand(seed){
  const s = Math.sin(seed * 12345.678) * 98765.4321;
  return s - Math.floor(s);
}

export const id = 'fireCss';
export const displayName = 'Fire CSS';
export const defaultParams = {
  flames: 1,
};
export const paramSchema = {
  flames: { type: 'number', min: 1, max: 10, step: 1, label: 'Flames' },
};

export function render(sceneF32, W, H, t, params){
  const flames = Math.max(1, Math.floor(params.flames ?? defaultParams.flames));
  const partSize = H * 0.4; // 5em of 12em container ≈ 40% of height
  sceneF32.fill(0);
  const containerW = W / flames;
  for (let f = 0; f < flames; f++){
    for (let p = 0; p < PARTS; p++){
      const seed = f * PARTS + p;
      const delay = rand(seed);
      const phase = (t / DUR + delay) % 1; // 0..1
      let opacity;
      if (phase < 0.25) opacity = phase * 4; // fade in
      else opacity = (1 - phase) * 4;        // fade out
      if (opacity <= 0) continue;
      const size = partSize * (1 - phase);
      const cx = f * containerW + (p / PARTS) * (containerW - partSize) + partSize / 2;
      const cy = H - phase * H; // rise upward
      const radius = size * 0.5;
      const minx = Math.max(0, Math.floor(cx - radius));
      const maxx = Math.min(W - 1, Math.ceil(cx + radius));
      const miny = Math.max(0, Math.floor(cy - radius));
      const maxy = Math.min(H - 1, Math.ceil(cy + radius));
      for (let y = miny; y <= maxy; y++){
        for (let x = minx; x <= maxx; x++){
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          const falloff = 1 - dist / radius;
          const a = opacity * falloff;
          const i = (y * W + x) * 3;
          sceneF32[i]   += FIRE_COLOR[0] * a;
          sceneF32[i+1] += FIRE_COLOR[1] * a;
          sceneF32[i+2] += FIRE_COLOR[2] * a;
        }
      }
    }
  }
  for (let i = 0; i < sceneF32.length; i++){
    sceneF32[i] = clamp01(sceneF32[i]);
  }
}
