# UI

Browser interface providing live preview and controls.

- `index.html` – control layout and canvas elements grouped into Effect, General, Strobe and Tint sections.
- `main.mjs` – entry point for JS logic, wiring modules together, exposes a 'run' function.
- `connection.mjs` – WebSocket setup and message handling.
- `ui-controls.mjs` – wires DOM controls to params and renders effect-specific widgets.
- `controls/` – reusable widgets and `renderControls` helper.
- `renderer.mjs` – scene generation and drawing. The preview dims non-pixel areas while showing LED samples in fully saturated, bright colors for clearer contrast.
- `flames.mjs` – generates animated CSS flames used by the `fireCss` effect.

The UI now includes a CSS-based `fireCss` effect with a control for how many flames appear.

`ui-controls.mjs` now interacts with namespaced params (`effects` and `post`).
