import { render as renderFire, defaultParams as baseDefaults, paramSchema as baseSchema } from './fire.mjs';

export const id = 'fireCss';
export const displayName = 'Fire CSS';

export const defaultParams = {
  numFlames: 1,
  ...baseDefaults,
};

export const paramSchema = {
  numFlames: { type: 'number', min: 1, max: 10, step: 1 },
  ...baseSchema,
};

const scratch = {};

export function render(sceneF32, W, H, t, params){
  const { numFlames = 1, ...fireParams } = params;
  const flameW = Math.floor(W / numFlames);
  for (let f = 0; f < numFlames; f++){
    const xOff = f * flameW;
    const buf = getBuffer(flameW, H);
    renderFire(buf, flameW, H, t, fireParams);
    blit(buf, sceneF32, flameW, W, H, xOff);
  }
}

function getBuffer(w, h){
  const key = w + 'x' + h;
  if (!scratch[key]) scratch[key] = new Float32Array(w * h * 3);
  return scratch[key];
}

function blit(src, dst, srcW, dstW, h, xOff){
  for (let y = 0; y < h; y++){
    const srcRow = src.subarray(y * srcW * 3, (y + 1) * srcW * 3);
    dst.set(srcRow, (y * dstW + xOff) * 3);
  }
}
