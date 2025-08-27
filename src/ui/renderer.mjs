import { sliceSection, clamp01 } from "../effects/modifiers.mjs";
import { renderScene } from "../render-scene.mjs";

let offscreen = null, offCtx = null;
let extendedFrame = null;

function drawSceneToCanvas(ctx, sceneF32, sceneW, sceneH, win, doc){
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
  const dim = 0.75; // dim factor for non-pixel regions
  for (let i = 0, j = 0; i < sceneF32.length; i += 3, j += 4){
    img.data[j]   = Math.round(clamp01(sceneF32[i]) * 255 * dim);
    img.data[j+1] = Math.round(clamp01(sceneF32[i+1]) * 255 * dim);
    img.data[j+2] = Math.round(clamp01(sceneF32[i+2]) * 255 * dim);
    img.data[j+3] = 255;
  }
  offCtx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.drawImage(offscreen, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawSectionsToCanvas(ctx, sceneF32, layout, sceneW, sceneH){
  const Wc = ctx.canvas.width, Hc = ctx.canvas.height;
  ctx.lineWidth = 6;
  // Faint guideline for non-pixel wires
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  layout.runs.forEach(run => {
    run.sections.forEach(sec => {
      const y = sec.y * Hc;
      const x0 = (sec.x0 / layout.sampling.width) * Wc;
      const x1 = (sec.x1 / layout.sampling.width) * Wc;

      ctx.beginPath(); ctx.moveTo(x0 - 3, y); ctx.lineTo(x1 + 3, y); ctx.stroke();

      const bytes = sliceSection(sceneF32, sceneW, sceneH, sec, layout.sampling);
      for (let i = 0; i < sec.led_count; i++){
        const t = sec.led_count > 1 ? i / (sec.led_count - 1) : 0;
        const x = x0 + (x1 - x0) * t;
        const j = i * 3;
        const r = bytes[j];
        const g = bytes[j+1];
        const b = bytes[j+2];
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x-2, y-2, 4, 4);
      }
    });
  });
}

// frame: render once, draw to both previews, then schedule the next loop
export function frame(
  win,
  doc,
  ctxL, ctxR,
  leftFrame, rightFrame,
  P,
  layoutLeft, layoutRight,
  sceneW, sceneH
) {
  const t = win.performance.now() / 1000;
  const mode = P.renderMode;
  if (mode === "extended"){
    const W = sceneW * 2;
    if (!extendedFrame || extendedFrame.length !== W * sceneH * 3){
      extendedFrame = new Float32Array(W * sceneH * 3);
    }
    renderScene(extendedFrame, W, sceneH, t, P);
    for (let y = 0; y < sceneH; y++){
      const src = y * W * 3;
      const dst = y * sceneW * 3;
      leftFrame.set(extendedFrame.subarray(src, src + sceneW * 3), dst);
      rightFrame.set(extendedFrame.subarray(src + sceneW * 3, src + W * 3), dst);
    }
  } else {
    renderScene(leftFrame, sceneW, sceneH, t, P);
    if (mode === "mirror"){
      for (let y = 0; y < sceneH; y++){
        for (let x = 0; x < sceneW; x++){
          const src = ((sceneH - 1 - y) * sceneW + (sceneW - 1 - x)) * 3;
          const dst = (y * sceneW + x) * 3;
          rightFrame[dst]   = leftFrame[src];
          rightFrame[dst+1] = leftFrame[src+1];
          rightFrame[dst+2] = leftFrame[src+2];
        }
      }
    } else {
      rightFrame.set(leftFrame);
    }
  }
  drawSceneToCanvas(ctxL, leftFrame, sceneW, sceneH, win, doc);
  if (layoutLeft) drawSectionsToCanvas(ctxL, leftFrame, layoutLeft, sceneW, sceneH);
  drawSceneToCanvas(ctxR, rightFrame, sceneW, sceneH, win, doc);
  if (layoutRight) drawSectionsToCanvas(ctxR, rightFrame, layoutRight, sceneW, sceneH);
  win.requestAnimationFrame(() => frame(win, doc, ctxL, ctxR, leftFrame, rightFrame, P, layoutLeft, layoutRight, sceneW, sceneH));
}
