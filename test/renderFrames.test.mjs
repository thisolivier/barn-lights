import test from 'node:test';
import assert from 'node:assert';
import { renderFrames, SCENE_W, SCENE_H } from '../src/render-scene.mjs';

const baseParams = {
  effect: 'gradient',
  effects: {
    gradient: {
      stops: [
        { pos: 0, color: [0, 0, 1] },
        { pos: 1, color: [1, 0, 0] },
      ],
      gradPhase: 0,
    },
  },
  post: {
    tint: [1, 1, 1],
    brightness: 1,
    gamma: 1,
    strobeHz: 0,
    strobeDuty: 0.5,
    strobeLow: 0,
    pitchSpeed: 0,
    yawSpeed: 0,
    pitch: 0,
    yaw: 0,
  },
  renderMode: 'duplicate',
};

test('extended mode splits gradient across frames', () => {
  const leftFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  const rightFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  const params = { ...baseParams, renderMode: 'extended' };
  renderFrames(leftFrame, rightFrame, params, 0);
  assert.notStrictEqual(leftFrame[0], rightFrame[0]);
});

test('mirror mode reflects frame ends', () => {
  const leftFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  const rightFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  const params = { ...baseParams, renderMode: 'mirror' };
  renderFrames(leftFrame, rightFrame, params, 0);
  const firstPixelLeft = [leftFrame[0], leftFrame[1], leftFrame[2]];
  const lastIndex = (SCENE_W - 1) * 3;
  const lastPixelLeft = [
    leftFrame[lastIndex],
    leftFrame[lastIndex + 1],
    leftFrame[lastIndex + 2],
  ];
  // Ensure gradient produced different edge colors
  assert.notDeepStrictEqual(firstPixelLeft, lastPixelLeft);
  const firstPixelRight = [rightFrame[0], rightFrame[1], rightFrame[2]];
  const lastIndexRight = (SCENE_W - 1) * 3;
  const lastPixelRight = [
    rightFrame[lastIndexRight],
    rightFrame[lastIndexRight + 1],
    rightFrame[lastIndexRight + 2],
  ];
  assert.deepStrictEqual(firstPixelRight, lastPixelLeft);
  assert.deepStrictEqual(lastPixelRight, firstPixelLeft);
});

test('duplicate mode copies gradient to both frames', () => {
  const leftFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  const rightFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  renderFrames(leftFrame, rightFrame, baseParams, 0);
  const lastIndex = (SCENE_W - 1) * 3;
  assert.strictEqual(leftFrame[0], rightFrame[0]);
  assert.strictEqual(leftFrame[1], rightFrame[1]);
  assert.strictEqual(leftFrame[lastIndex], rightFrame[lastIndex]);
  assert.strictEqual(leftFrame[lastIndex + 1], rightFrame[lastIndex + 1]);
});

