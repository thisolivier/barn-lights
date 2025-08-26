import {
  applyBrightnessTint as _applyBrightnessTint,
  applyGamma as _applyGamma,
  applyStrobe as _applyStrobe,
  transformScene as _transformScene,
} from "./modifiers.mjs";

function applyStrobe(sceneF32, t, post, W, H){
  _applyStrobe(sceneF32, t, post.strobeHz, post.strobeDuty, post.strobeLow);
}

function applyBrightnessTint(sceneF32, t, post, W, H){
  _applyBrightnessTint(sceneF32, post.tint, post.brightness);
}

function applyGamma(sceneF32, t, post, W, H){
  _applyGamma(sceneF32, post.gamma);
}

function applyTransform(sceneF32, t, post, W, H){
  const sx = ((t * post.pitchSpeed) % W + W) % W;
  const sy = ((t * post.rollSpeed) % H + H) % H;
  const ang = (t * post.yawSpeed) % (Math.PI * 2);
  _transformScene(sceneF32, W, H, sx, sy, ang);
}

export const postPipeline = [applyStrobe, applyBrightnessTint, applyGamma, applyTransform];

export function registerPostModifier(fn){
  postPipeline.push(fn);
}
