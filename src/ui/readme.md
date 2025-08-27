# UI

Browser interface providing live preview and controls.

- `index.html` – control layout and canvas elements grouped into Effect, General, Strobe and Tint sections. The effect selector is populated at runtime from the shared effects map and the General section now includes pitch and yaw sliders for directional control.
- `main.mjs` – entry point for JS logic, wiring modules together, exposes a 'run' function.
- `connection.mjs` – WebSocket setup and message handling.
- `controls-logic.mjs` – wires DOM controls to params and renders effect-specific widgets.
- `presets.mjs` – fetches preset names and populates the dropdown list.
- Preset controls allow saving and loading configuration snapshots.
- `subviews/` – reusable widgets and `renderControls` helper.
- `renderer.mjs` – scene generation and drawing, supporting duplicate/extended/mirror render modes.