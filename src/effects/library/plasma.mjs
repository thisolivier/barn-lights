const mix = (a, b, t) => a + (b - a) * t;
const mix3 = (A, B, t) => [mix(A[0], B[0], t), mix(A[1], B[1], t), mix(A[2], B[2], t)];

function vnoise2(x, y) {
  return 0.5 + 0.5 * Math.sin((x * 12.9898 + y * 78.233) * 43758.5453);
}

function fbm(x, y, octaves = 5) {
  let amplitude = 0.5;
  let frequency = 1;
  let value = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * vnoise2(x * frequency, y * frequency);
    frequency *= 2;
    amplitude *= 0.5;
  }
  return value;
}

function sampleGradient(stops, u) {
  const sorted = stops.slice().sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
  let index = 1;
  while (index < sorted.length && u >= sorted[index].pos) index++;
  const left = sorted[index - 1];
  const right = sorted[index] || { pos: sorted[0].pos + 1, color: sorted[0].color };
  const span = right.pos - left.pos;
  const t = span > 0 ? (u - left.pos) / span : 0;
  return mix3(left.color, right.color, t);
}

export const id = 'plasma';
export const displayName = 'Plasma';
export const defaultParams = {
  rotationSpeed: 0.4,
  noiseScale: 3.0,
  colorStops: [
    { pos: 0.0, color: [0.0, 0.0, 0.5] },
    { pos: 0.5, color: [1.0, 0.0, 0.5] },
    { pos: 1.0, color: [1.0, 1.0, 0.0] },
  ],
};
export const paramSchema = {
  rotationSpeed: { type: 'number', min: 0, max: 5, step: 0.01 },
  noiseScale: { type: 'number', min: 0.1, max: 10, step: 0.1 },
  colorStops: { type: 'colorStops', label: 'Colors' },
};

export function render(sceneF32, W, H, t, params) {
  const { rotationSpeed = 0.4, noiseScale = 3.0, colorStops = [] } = params;
  if (colorStops.length < 2) return;
  const angle = t * rotationSpeed;
  const cosineAngle = Math.cos(angle);
  const sineAngle = Math.sin(angle);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W - 0.5;
      const v = y / H - 0.5;
      const rotatedX = cosineAngle * u - sineAngle * v;
      const rotatedY = sineAngle * u + cosineAngle * v;
      const noiseValue = fbm(rotatedX * noiseScale, rotatedY * noiseScale, 5);
      const rgb = sampleGradient(colorStops, noiseValue % 1);
      const i = (y * W + x) * 3;
      sceneF32[i] = rgb[0];
      sceneF32[i + 1] = rgb[1];
      sceneF32[i + 2] = rgb[2];
    }
  }
}

