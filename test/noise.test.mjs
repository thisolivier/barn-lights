import test from 'node:test';
import assert from 'assert/strict';
import * as noise from '../src/effects/library/noise.mjs';

const get = (scene, W, x, y) => {
  const i = (y * W + x) * 3;
  return [scene[i], scene[i + 1], scene[i + 2]];
};

const approxEqual = (a, b) => Math.abs(a - b) < 1e-6;

test('uses provided gradient stops', () => {
  const W = 1, H = 10;
  const scene1 = new Float32Array(W * H * 3);
  const scene2 = new Float32Array(W * H * 3);
  const paramsBase = { noiseSpeed: 0, noiseScale: 1, noiseIntensity: 1 };
  noise.render(scene1, W, H, 0, { ...paramsBase, stops: [
    { pos: 0, color: [0, 0, 0] },
    { pos: 1, color: [1, 0, 0] },
  ]});
  noise.render(scene2, W, H, 0, { ...paramsBase, stops: [
    { pos: 0, color: [0, 0, 0] },
    { pos: 1, color: [0, 1, 0] },
  ]});
  const bottomPixel1 = get(scene1, W, 0, H - 1);
  const bottomPixel2 = get(scene2, W, 0, H - 1);
  assert(bottomPixel1[0] > 0);
  assert(bottomPixel2[1] > 0);
  assert(bottomPixel1[1] === 0);
  assert(bottomPixel2[0] === 0);
  assert(approxEqual(bottomPixel1[0], bottomPixel2[1]));
});
