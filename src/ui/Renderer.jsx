import React, { useEffect, useRef } from 'react';
import { renderFrame, clearImageCaches } from './renderer.mjs';

export default function Renderer({ getParams, layoutLeft, layoutRight, sceneWidth, sceneHeight }) {
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
      renderFrame(win, contextLeft, contextRight, leftFrame, rightFrame, getParams, layoutLeft, layoutRight, sceneWidth, sceneHeight);
      frameRequest = win.requestAnimationFrame(loop);
    };
    frameRequest = win.requestAnimationFrame(loop);

    return () => {
      if (frameRequest) win.cancelAnimationFrame(frameRequest);
      clearImageCaches();
    };
  }, [getParams, layoutLeft, layoutRight, sceneWidth, sceneHeight]);

  return (
    <div className="barn">
      <canvas id="left" ref={canvasLeftRef} width="512" height="128"></canvas>
      <canvas id="right" ref={canvasRightRef} width="512" height="128"></canvas>
    </div>
  );
}

