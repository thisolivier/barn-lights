# Web Modules

This directory contains the browser-side code for the BarnLights preview.

- `network.mjs` – handles WebSocket setup and layout fetching via `connect()` and `loadLayouts()`.
- `ui.mjs` – binds DOM controls and hotkeys with `initUI()` and updates the page with `applyUI()`.
- `render.mjs` – pure rendering helpers: `renderScene`, `drawScene`, and `startPreview` which drives the animation loop.
- `preview.mjs` – a thin bootstrapper that wires the above pieces together.
