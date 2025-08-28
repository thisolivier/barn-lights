# UI

Browser interface providing a live preview above a panel of controls.


- `index.html` – UI control layout and React mount point for the preview.
- `main.mjs` – fetches layouts and exposes handlers used by the React app.
- `App.jsx` – top-level React component that invokes `run` and provides context.
- `Renderer.jsx` – React component rendering preview canvases and driving the frame loop.
- `main.jsx` – React entry rendering `<App />`.
- `useWebSocket.js` – React hook for managing WebSocket connections.
- `WebSocketContext.js` – context provider exposing the connection to components.
- `ParamsContext.js` – React context backed by a `useReducer` hook mirroring the runtime parameter object. Dispatching patches updates state and sends them over the WebSocket.
- `ControlPanel.jsx` – React panel rendering presets and parameter controls using context state.
- `renderer.mjs` – draws a single frame for both walls and overlays per‑LED indicators.
- `presets.mjs` – handles saving/retreiving configuration and listing the saved options with thumbnails.
- `subviews/` – React widgets for effect parameters and `EffectControls` mapper.

The UI is bundled with Webpack, treating this directory as the source and writing output to `dist/`.
The generated `index.html` references the compiled bundle with `<script src="/bundle.js"></script>`.
