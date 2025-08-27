import test from 'node:test';
import assert from 'node:assert';
import { renderFrames, SCENE_W, SCENE_H } from '../src/render-scene.mjs';
import { drawSceneToCanvas } from '../src/ui/renderer.mjs';

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

test('mirror mode reflects last pixel to right frame start', () => {
  const leftFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  const rightFrame = new Float32Array(SCENE_W * SCENE_H * 3);
  const params = { ...baseParams, renderMode: 'mirror' };
  renderFrames(leftFrame, rightFrame, params, 0);
  const lastPixelIndex = (SCENE_W - 1) * 3;
  assert.strictEqual(rightFrame[0], leftFrame[lastPixelIndex]);
  assert.strictEqual(rightFrame[1], leftFrame[lastPixelIndex + 1]);
  assert.strictEqual(rightFrame[2], leftFrame[lastPixelIndex + 2]);
});

test('drawSceneToCanvas maintains separate buffers', () => {
  class StubContext {
    constructor(width, height) {
      this.canvas = { width, height };
      this.imageData = new Uint8ClampedArray(width * height * 4);
      this.imageSmoothingEnabled = true;
    }
    createImageData(width, height) {
      return { data: new Uint8ClampedArray(width * height * 4) };
    }
    putImageData(img, x, y) {
      this.imageData.set(img.data);
    }
    getImageData(x, y, width, height) {
      const length = width * height * 4;
      return { data: this.imageData.slice(0, length) };
    }
  }
  class OffscreenCanvas {
    constructor(width, height) {
      this.context2d = new StubContext(width, height);
    }
    getContext(type) {
      return type === '2d' ? this.context2d : null;
    }
  }
  const canvasA = new OffscreenCanvas(1, 1);
  const canvasB = new OffscreenCanvas(1, 1);
  const frameA = new Float32Array([1, 0, 0]);
  const frameB = new Float32Array([0, 1, 0]);
  drawSceneToCanvas(canvasA.getContext('2d'), frameA, 1, 1);
  drawSceneToCanvas(canvasB.getContext('2d'), frameB, 1, 1);
  const pixelsA = canvasA.getContext('2d').getImageData(0, 0, 1, 1).data;
  const pixelsB = canvasB.getContext('2d').getImageData(0, 0, 1, 1).data;
  assert.deepStrictEqual(Array.from(pixelsA.slice(0, 3)), [191, 0, 0]);
  assert.deepStrictEqual(Array.from(pixelsB.slice(0, 3)), [0, 191, 0]);
});
