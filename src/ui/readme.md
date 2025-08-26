# UI

Browser interface providing live preview and controls.

- `index.html` – control layout and canvas elements grouped into Effect, General, Strobe and Tint sections.
- `main.mjs` – entry point for JS logic, wiring modules together, exposes a 'run' function.
- `connection.mjs` – WebSocket setup and message handling.
- `ui-controls.mjs` – wires DOM controls to params and renders effect-specific widgets, including a wall mode selector (`duplicate`, `independent`, `extend`).
- `controls/` – reusable widgets and `renderControls` helper.
- `renderer.mjs` – scene generation and drawing. The preview dims non-pixel areas while showing LED samples in fully saturated, bright colors for clearer contrast.

The UI now includes a `fire` effect using a GIF source with hue, saturation, speed, angle, and scale controls, as well as a `noise` effect.

`ui-controls.mjs` now interacts with namespaced params (`effects` and `post`).
