# Tests

Automated checks for BarnLights Playbox:

- `engine.test.mjs` – validates engine output and config section lengths.
- `engine-layout.test.mjs` – ensures layout loading rejects malformed files.
- `config.test.mjs` – verifies configuration LED totals and section bounds.
- `web.test.mjs` – loads the browser preview and fails on console errors.

Run with `npm test`.
