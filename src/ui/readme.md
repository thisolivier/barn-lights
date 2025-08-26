# UI

Browser interface providing live preview and controls.

- `index.html` – control layout and canvas elements grouped into Effect, General, Strobe and Tint sections. The General section now includes a roll/pitch joystick and yaw slider for directional control.
- `main.mjs` – entry point for JS logic, wiring modules together, exposes a 'run' function.
- `connection.mjs` – WebSocket setup and message handling.
- `ui-controls.mjs` – wires DOM controls to params and renders effect-specific widgets.
- `controls/` – reusable widgets and `renderControls` helper. Motion controls are split into `controls/rollPitchJoystick.mjs` and `controls/yawSlider.mjs`.
- `renderer.mjs` – scene generation and drawing (relies on render functions within each effect).

`ui-controls.mjs` now interacts with namespaced params (`effects` and `post`).
