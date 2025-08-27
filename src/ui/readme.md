# UI

Browser interface providing a live preview above a panel of controls.


- `index.html` – UI control layout and visual effect preview.
- `main.mjs` – entry point for JS logic, wiring modules together, exposes a `run` function that updates state through dispatches.
- `App.jsx` – top-level React component that invokes `run` and provides context.
- `main.jsx` – React entry rendering `<App />`.
- `useWebSocket.js` – React hook for managing WebSocket connections.
- `WebSocketContext.js` – context provider exposing the connection to components.
- `ParamsContext.js` – React context backed by a `useReducer` hook mirroring the runtime parameter object. Dispatching patches updates state and sends them over the WebSocket.
- `renderer.mjs` – uses `renderFrames` to draw the scene for both walls and overlay per-LED indicators.
- `presets.mjs` – handles saving/retreiving configuration and listing the saved options with thumbnails.
- `subviews/` – reusable widgets and `renderControls` helper.

The UI is bundled with Webpack, treating this directory as the source and writing output to `dist/`.
