# Tests

Automated checks for BarnLights Playbox:

- `engine.test.mjs` – validates engine output and config section lengths.
- `engine-initial-output.test.mjs` – verifies the first stdout line from the engine is NDJSON.
- `engine-layout.test.mjs` – ensures layout loading rejects malformed files.
- `config.test.mjs` – verifies configuration LED totals and section bounds.
- `preset.test.mjs` – saves and loads effect presets and their preview images.
- `preset-ui.test.mjs` – ensures the preset panel reflects available files.
- `web.test.mjs` – loads the browser preview and fails on console errors. Set `BARN_LIGHTS_SKIP_WEB_TEST=1` to skip this check when browser dependencies are missing.
- `renderFrames.test.mjs` – verifies duplicate, extended, and mirror frame-splitting modes.
- `gradient.test.mjs` – confirms the gradient effect can reverse direction.
- `noise.test.mjs` – ensures the noise effect honors custom gradient stops.

The engine exports a `start` function and is invoked via `bin/engine.mjs`, which also launches the HTTP server. Web server and engine can be invoked independently for testing.

Run with `npm test`.
