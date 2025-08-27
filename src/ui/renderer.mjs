import { drawSceneToCanvas, drawSectionsToCanvas } from './preview-renderer.mjs';
import { renderScene } from '../render-scene.mjs';

// frame: render the scene according to renderMode and draw to both previews
export function frame(
  win,
  doc,
  ctxL, ctxR,
  leftFrame, rightFrame,
  P,
  layoutLeft, layoutRight,
  sceneW, sceneH
) {
  const extended = new Float32Array(sceneW * 2 * sceneH * 3);
  function loop(){
    const t = win.performance.now() / 1000;
    if (P.renderMode === 'extended') {
      renderScene(extended, t, P, sceneW * 2, sceneH);
      const stride = sceneW * 6;
      for (let y = 0; y < sceneH; y++) {
        const row = y * stride;
        leftFrame.set(extended.subarray(row, row + sceneW * 3), y * sceneW * 3);
        rightFrame.set(extended.subarray(row + sceneW * 3, row + sceneW * 6), y * sceneW * 3);
      }
    } else {
      renderScene(leftFrame, t, P, sceneW, sceneH);
      if (P.renderMode === 'mirror') {
        const rowStride = sceneW * 3;
        for (let y = 0; y < sceneH; y++) {
          for (let x = 0; x < sceneW; x++) {
            const src = y * rowStride + x * 3;
            const dst = y * rowStride + (sceneW - 1 - x) * 3;
            rightFrame[dst] = leftFrame[src];
            rightFrame[dst + 1] = leftFrame[src + 1];
            rightFrame[dst + 2] = leftFrame[src + 2];
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
    win.requestAnimationFrame(loop);
  }
  loop();
}

