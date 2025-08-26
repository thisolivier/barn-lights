import { effects } from "../effects/index.mjs";
import { sliceSection, clamp01, copyBuffer, flipHorizontal } from "../effects/modifiers.mjs";
import { postPipeline, registerPostModifier } from "../effects/post.mjs";

export { registerPostModifier };

let offscreen = null, offCtx = null;
let freeze = false;
let bothF = null;
const BACK_DIM = 0.5; // brightness for background scene

export function toggleFreeze(){
  freeze = !freeze;
}

export function renderScene(target, side, t, P, sceneW, sceneH){
  const effect = effects[P.effect] || effects["gradient"];
  const effectParams = P.effects[effect.id] || {};
  effect.render(target, sceneW, sceneH, t, effectParams, side);
  const post = P.post;
  for (const fn of postPipeline) {
    fn(target, t, post, sceneW, sceneH);
  }
}

export function drawScene(ctx, sceneF32, sceneW, sceneH, win, doc){
  if (!offscreen || offscreen.width !== sceneW || offscreen.height !== sceneH){
    if (win.OffscreenCanvas){
      offscreen = new win.OffscreenCanvas(sceneW, sceneH);
    } else {
      offscreen = doc.createElement("canvas");
      offscreen.width = sceneW;
      offscreen.height = sceneH;
    }
    offCtx = offscreen.getContext("2d");
  }
  const img = offCtx.createImageData(sceneW, sceneH);
  for (let i = 0, j = 0; i < sceneF32.length; i += 3, j += 4){
    img.data[j]   = Math.round(clamp01(sceneF32[i]) * 255 * BACK_DIM);
    img.data[j+1] = Math.round(clamp01(sceneF32[i+1]) * 255 * BACK_DIM);
    img.data[j+2] = Math.round(clamp01(sceneF32[i+2]) * 255 * BACK_DIM);
    img.data[j+3] = 255;
  }
  offCtx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.drawImage(offscreen, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawSections(ctx, sceneF32, layout, sceneW, sceneH){
  const Wc = ctx.canvas.width, Hc = ctx.canvas.height;
  ctx.lineWidth = 2;
  // Faint guideline for non-pixel wires
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  layout.runs.forEach(run => {
    run.sections.forEach(sec => {
      const y = sec.y * Hc;
      const x0 = (sec.x0 / layout.sampling.width) * Wc;
      const x1 = (sec.x1 / layout.sampling.width) * Wc;

      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();

      const bytes = sliceSection(sceneF32, sceneW, sceneH, sec, layout.sampling);
      for (let i = 0; i < sec.led_count; i++){
        const t = sec.led_count > 1 ? i / (sec.led_count - 1) : 0;
        const x = x0 + (x1 - x0) * t;
        const j = i * 3;
        const boost = 1 / BACK_DIM;
        const r = Math.min(255, Math.round(clamp01(bytes[j]) * 255 * boost));
        const g = Math.min(255, Math.round(clamp01(bytes[j+1]) * 255 * boost));
        const b = Math.min(255, Math.round(clamp01(bytes[j+2]) * 255 * boost));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x-2, y-2, 4, 4);
      }
    });
  });
}

export function frame(win, doc, ctxL, ctxR, leftF, rightF, P, layoutLeft, layoutRight, sceneW, sceneH){
  const t = freeze ? 0 : win.performance.now() / 1000;
  switch (P.wallMode) {
    case "extendCrazy": {
      const len = leftF.length;
      if (!bothF || bothF.length !== len * 2) bothF = new Float32Array(len * 2);
      renderScene(bothF, "both", t, P, sceneW * 2, sceneH);
      copyBuffer(leftF, bothF.subarray(0, len));
      copyBuffer(rightF, bothF.subarray(len));
      break;
    }
    case "mirrorLR":
      renderScene(leftF, "left", t, P, sceneW, sceneH);
      flipHorizontal(rightF, leftF, sceneW, sceneH);
      break;
    case "duplicate":
    default:
      renderScene(leftF, "left", t, P, sceneW, sceneH);
      renderScene(rightF, "right", t, P, sceneW, sceneH);
      break;
  }
  drawScene(ctxL, leftF, sceneW, sceneH, win, doc);
  if (layoutLeft)  drawSections(ctxL, leftF, layoutLeft, sceneW, sceneH);
  drawScene(ctxR, rightF, sceneW, sceneH, win, doc);
  if (layoutRight) drawSections(ctxR, rightF, layoutRight, sceneW, sceneH);
  win.requestAnimationFrame(()=>frame(win, doc, ctxL, ctxR, leftF, rightF, P, layoutLeft, layoutRight, sceneW, sceneH));
}
