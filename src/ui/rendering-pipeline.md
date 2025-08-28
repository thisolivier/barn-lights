# Rendering pipeline

The browser preview converts runtime parameters into per-wall frame buffers.

1. `CanvasPreview.js` drives a `requestAnimationFrame` loop.
2. Each tick calls `renderFrame` from `renderer.mjs` which fills left and
   right `Float32Array` buffers using `renderFrames`.
3. The buffers are drawn onto paired `<canvas>` elements and optional layout
   overlays.
4. Layout JSON files are fetched once per side and cached in `layout-service.js`
   to avoid repeated network requests when React reinitializes runtime helpers.

The loop is stateless outside the provided `getParams` callback so React's
state updates do not spawn extra animation frames.
