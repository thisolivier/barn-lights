# Tests

Automated checks for BarnLights Playbox:

- `engine.test.mjs` – validates engine output and config section lengths.
- `engine-layout.test.mjs` – ensures layout loading rejects malformed files.
- `config.test.mjs` – verifies configuration LED totals and section bounds.
- `web.test.mjs` – loads the browser preview and fails on console errors.

The engine exports a `start` function and is invoked via `bin/engine.mjs`, which also launches the HTTP server. Web server and engine can be invoked independently for testing.

Run with `npm test`.
