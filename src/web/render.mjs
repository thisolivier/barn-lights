import {
  genGradient, genSolid, genFire,
  applyBrightnessTint, applyGamma, applyStrobe, applyRollX,
  sliceSection, clamp01
} from "../effects.mjs";

export function renderScene(target, side, t, params, sceneW, sceneH) {
  switch (params.effect) {
    case "solid": genSolid(target, sceneW, sceneH, t, params, side); break;
    case "fire":  genFire(target,  sceneW, sceneH, t, params);      break;
    default:      genGradient(target, sceneW, sceneH, t, params);    break;
  }
  applyStrobe(target, t, params.strobeHz, params.strobeDuty, params.strobeLow);
  applyBrightnessTint(target, params.tint, params.brightness);
  applyGamma(target, params.gamma);
  applyRollX(target, sceneW, sceneH, params.rollPx);
}

let offscreen = null, offCtx = null;

export function drawScene(ctx, sceneF32, sceneW, sceneH, doc = globalThis.document, win = doc.defaultView || globalThis) {
  if (!offscreen || offscreen.width !== sceneW || offscreen.height !== sceneH) {
    if (win.OffscreenCanvas) {
      offscreen = new win.OffscreenCanvas(sceneW, sceneH);
    } else {
      offscreen = doc.createElement("canvas");
      offscreen.width = sceneW;
      offscreen.height = sceneH;
    }
    offCtx = offscreen.getContext("2d");
  }
  const img = offCtx.createImageData(sceneW, sceneH);
  for (let i = 0, j = 0; i < sceneF32.length; i += 3, j += 4) {
    img.data[j]   = Math.round(clamp01(sceneF32[i]) * 255);
    img.data[j+1] = Math.round(clamp01(sceneF32[i+1]) * 255);
    img.data[j+2] = Math.round(clamp01(sceneF32[i+2]) * 255);
    img.data[j+3] = 255;
  }
  offCtx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(offscreen, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function startPreview(win, doc, ctxL, ctxR, getParams, sceneW, sceneH, layoutLeft, layoutRight) {
  const leftF  = new Float32Array(sceneW * sceneH * 3);
  const rightF = new Float32Array(sceneW * sceneH * 3);
  let freeze = false;

  function drawSections(ctx, sceneF32, layout) {
    const Wc = ctx.canvas.width, Hc = ctx.canvas.height;
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.6)";
    layout.runs.forEach(run => {
      run.sections.forEach(sec => {
        const y = sec.y * Hc;
        const x0 = (sec.x0 / layout.sampling.width) * Wc;
        const x1 = (sec.x1 / layout.sampling.width) * Wc;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        const bytes = sliceSection(sceneF32, sceneW, sceneH, sec, layout.sampling);
        for (let i = 0; i < sec.led_count; i++) {
          const t = sec.led_count > 1 ? i / (sec.led_count - 1) : 0;
          const x = x0 + (x1 - x0) * t;
          const j = i * 3;
          ctx.fillStyle = `rgb(${bytes[j]},${bytes[j+1]},${bytes[j+2]})`;
          ctx.fillRect(x-1, y-1, 2, 2);
        }
      });
    });
  }

  function frame() {
    const t = freeze ? 0 : win.performance.now() / 1000;
    const params = getParams();
    renderScene(leftF,  "left",  t, params, sceneW, sceneH);
    if (params.mirrorWalls) rightF.set(leftF); else renderScene(rightF, "right", t, params, sceneW, sceneH);
    drawScene(ctxL, leftF, sceneW, sceneH, doc, win);
    if (layoutLeft)  drawSections(ctxL, leftF, layoutLeft);
    drawScene(ctxR, rightF, sceneW, sceneH, doc, win);
    if (layoutRight) drawSections(ctxR, rightF, layoutRight);
    win.requestAnimationFrame(frame);
  }

  win.requestAnimationFrame(frame);
  return { toggleFreeze() { freeze = !freeze; } };
}
