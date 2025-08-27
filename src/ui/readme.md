# UI

Browser interface providing a live preview above a panel of controls.


- `index.html` – UI control layout and visual effect preview.
- `main.mjs` – entry point for JS logic, wiring modules together, exposes a 'run' function.
- `connection.mjs` – WebSocket setup and message handling.
- `controls-logic.mjs` – wires DOM controls to params and renders effect-specific widgets.
- `renderer.mjs` – uses `renderFrames` to draw the scene for both walls and overlay per-LED indicators.
- `presets.mjs` – handles saving/retrieving configuration and rendering the saved preset panel with thumbnails.
- `subviews/` – reusable widgets and `renderControls` helper.
