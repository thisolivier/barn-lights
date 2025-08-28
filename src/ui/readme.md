# UI

Browser interface providing a live preview above a panel of controls.


- `index.html` – UI control layout and React mount point for the preview.
- `main.mjs` – fetches layouts and exposes handlers used by the React app.
- `App.js` – top-level React component that invokes `run` and provides context. Optional `runFunction`, `renderFrame`, `shouldAnimate`, `ParamsProviderComponent`, and `WebSocketProviderComponent` props enable injecting test doubles.
- `CanvasPreview.js` – React component rendering preview canvases and driving the frame loop. Custom `renderFrame` and `shouldAnimate` props allow deterministic frame tests.
- `main.jsx` – React entry rendering `<App />`.
- `useWebSocket.js` – React hook for managing WebSocket connections with stable callback references to avoid unnecessary reconnections.
- `WebSocketContext.js` – context provider exposing the connection to components.
- `ParamsContext.js` – React context backed by a `useReducer` hook mirroring the runtime parameter object. Dispatching patches updates state and sends them over the WebSocket. The provider invokes its `onReady` callback once after mounting.
- `ControlPanel.jsx` – React panel rendering presets and parameter controls using context state.
- `render-preview-frame.mjs` – draws a single frame for both walls and overlays per‑LED indicators.
- `presets.mjs` – handles saving/retreiving configuration and listing the saved options with thumbnails.
- `subviews/` – React widgets for effect parameters and `EffectControls` mapper.

`render-preview-frame.mjs` relies on `renderFrames` from `../render-scene.mjs`, which serves as the source of truth for generating left and right frame buffers. `CanvasPreview.js` invokes this helper on each animation tick to populate the canvases.

The UI is bundled with Webpack, treating this directory as the source and writing output to `dist/`.
The generated `index.html` references the compiled bundle with `<script src="/bundle.js"></script>`.

Console logging traces runtime initialization, layout loading, WebSocket activity, preview rendering, and cleanup to aid debugging.
