import React, { useEffect, useRef } from 'react';
import { renderPreviewFrame as defaultRenderPreviewFrame, clearImageCaches } from './render-preview-frame.mjs';

export default function CanvasPreview({
  getParams,
  layoutLeft,
  layoutRight,
  sceneWidth,
  sceneHeight,
  renderFrame = defaultRenderPreviewFrame,
  shouldAnimate = true
}) {
  const canvasLeftRef = useRef(null);
  const canvasRightRef = useRef(null);

  useEffect(() => {
    if (!sceneWidth || !sceneHeight) return;
    const canvasLeft = canvasLeftRef.current;
    const canvasRight = canvasRightRef.current;
    if (!canvasLeft || !canvasRight) return;

    const contextLeft = canvasLeft.getContext('2d');
    const contextRight = canvasRight.getContext('2d');
    const leftFrame = new Float32Array(sceneWidth * sceneHeight * 3);
    const rightFrame = new Float32Array(sceneWidth * sceneHeight * 3);
    let frameRequest = 0;
    const win = canvasLeft.ownerDocument.defaultView || window;

    const loop = () => {
      renderFrame(
        win,
        contextLeft,
        contextRight,
        leftFrame,
        rightFrame,
        getParams,
        layoutLeft,
        layoutRight,
        sceneWidth,
        sceneHeight
      );
      if (shouldAnimate) {
        frameRequest = win.requestAnimationFrame(loop);
      }
    };
    if (shouldAnimate) {
      frameRequest = win.requestAnimationFrame(loop);
    } else {
      loop();
    }

    return () => {
      if (frameRequest && shouldAnimate) win.cancelAnimationFrame(frameRequest);
      clearImageCaches();
    };
  }, [getParams, layoutLeft, layoutRight, sceneWidth, sceneHeight, renderFrame, shouldAnimate]);

  return React.createElement(
    'div',
    { className: 'barn' },
    React.createElement('canvas', { id: 'left', ref: canvasLeftRef, width: '512', height: '128' }),
    React.createElement('canvas', { id: 'right', ref: canvasRightRef, width: '512', height: '128' })
  );
}

