# BarnLights Playbox (test harness)

Minimal Node + browser setup that:
- renders gradients / solid / fire onto a 2D virtual scene per side,
- applies strobe / brightness / tint / roll / gamma,
- samples per your layout JSON into per-row "slices",
- **emits SLICES_NDJSON to stdout** (one line per frame),
- serves a **live preview** with a light barn perspective and per-LED colored dots.

## Architecture
- `src/engine.mjs` renders frames and streams NDJSON.
- `src/server.mjs` serves the UI and relays WebSocket param updates.
- `src/ui/` contains the browser preview and controls.

Runtime parameters are grouped under `effects` for effect-specific settings
and `post` for modifiers like brightness, tint and strobe which can be applied ontop.
The top-level `wallMode` parameter chooses how the two walls are combined.
It can render each wall separately (`duplicate`), mirror the left wall into
the right horizontally (`mirrorLR`) or vertically (`mirrorTB`), or act as a
single wide scene spanning both sides (`extend`).

## Quick start
1. Open your terminal
2. Navigate to this directory
3. Execute the commands (node v20-22 required)
```bash
npm install
npm start
```
4.  Go to `localhost:8080` in your browser

## Running tests
```bash
npm test
```

## Acknowledgements
OpenAI's Codex, you are a boss. Welcome to the age of software on demand.
