# UI

Browser interface providing a live preview above a panel of controls.


## Component hierarchy

`<App>` is the root of the React UI. It wires up context providers and renders
the two primary pieces of the interface:

```
<App>
  ├─ <CanvasPreview />
  └─ <ControlPanel />
```

`<CanvasPreview />` shows the live scene on two canvases while
`<ControlPanel />` exposes sliders and preset management.

### Context flow

`<App>` wraps its children with two contexts:

- `ParamsContext` holds the runtime parameter state. Components such as
  `ControlPanel` dispatch patches to update this state. These updates are also
  forwarded over the active WebSocket connection.
- `WebSocketContext` exposes the WebSocket instance created by `useWebSocket`.
  `ParamsContext` uses it to send parameter patches, and other components can
  subscribe to messages if needed. `CanvasPreview` consumes parameter state to
  render each frame.


- `index.html` – UI control layout and React mount point for the preview.
- `layout-service.js` – fetches layouts and exposes handlers used by the React app.
- `App.js` – top-level React component that invokes `run` and provides context. Optional `runFunction`, `renderFrame`, `shouldAnimate`, `ParamsProviderComponent`, and `WebSocketProviderComponent` props enable injecting test doubles.
- `CanvasPreview.js` – React component rendering preview canvases and driving the frame loop. Custom `renderFrame` and `shouldAnimate` props allow deterministic frame tests.
- `main.js` – React entry rendering `<App />`.
- `useWebSocket.js` – React hook for managing WebSocket connections with stable callback references to avoid unnecessary reconnections.
- `WebSocketContext.js` – context provider exposing the connection to components.
- `ParamsContext.js` – React context backed by a `useReducer` hook mirroring the runtime parameter object. Dispatching patches updates state and sends them over the WebSocket. The provider invokes its `onReady` callback once after mounting.
- `ControlPanel.js` – React panel rendering presets and parameter controls using context state.
- `render-preview-frame.mjs` – draws a single frame for both walls and overlays per‑LED indicators.
- `presets.mjs` – handles saving/retreiving configuration and listing the saved options with thumbnails.
- `subviews/` – React widgets for effect parameters and `EffectControls` mapper.

`render-preview-frame.mjs` relies on `renderFrames` from `../render-scene.mjs`, which serves as the source of truth for generating left and right frame buffers. `CanvasPreview.js` invokes this helper on each animation tick to populate the canvases.

The UI is bundled with Webpack, treating this directory as the source and writing output to `dist/`.
The generated `index.html` references the compiled bundle with `<script src="/bundle.js"></script>`.

Console logging traces runtime initialization, layout loading, WebSocket activity, preview rendering, and cleanup to aid debugging.

## File extensions

- `.js` – React modules bundled with Webpack. With `"type": "module"` in `package.json`, these files are treated as ES modules.
- `.mjs` – standalone ES modules invoked directly by Node, such as `main.mjs` and `render-preview-frame.mjs`. They remain to highlight code paths that run outside the bundle. The plan is to rename these to `.js` for consistency as the pipeline stabilizes.
- `.html` – static entry template for the UI.
- `.ico` – favicon asset referenced by `index.html`.
- `.md` – documentation files like this one.
