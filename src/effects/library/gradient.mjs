import { sampleGradient } from './gradient-utils.mjs';

export const id = 'gradient';
export const displayName = 'Gradient';
export const defaultParams = {
  stops: [
    { pos: 0, color: [0.0, 0.0, 1.0] },
    { pos: 1, color: [1.0, 0.0, 0.0] },
  ],
  gradPhase: 0.0,
};
export const paramSchema = {
  stops: { type: 'colorStops', label: 'Stops' },
  gradPhase: { type: 'number', min: 0, max: 1, step: 0.001 },
};

export function render(sceneF32, W, H, t, params) {
  const { stops = [], gradPhase = 0 } = params;
  if (stops.length < 2) return;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = (x / W + gradPhase) % 1;
      const rgb = sampleGradient(stops, u);
      const i = (y * W + x) * 3;
      sceneF32[i] = rgb[0];
      sceneF32[i + 1] = rgb[1];
      sceneF32[i + 2] = rgb[2];
    }
  }
}
