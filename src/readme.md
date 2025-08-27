# Source modules

Core runtime code for BarnLights Playbox:

- `render-scene.mjs` – shared scene rendering, post-processing and `renderFrames` helper for mapping scenes to both walls.
- `engine.mjs` – side‑effect‑free render loop using `renderFrames` and exposing `params` (including `renderMode`); call `start()` to emit SLICES_NDJSON.
- `server.mjs` – HTTP/WebSocket server serving the pre-built UI (`ui/dist/index.html` and `bundle.js`) and applying param updates.
- `config-store.mjs` – read/write helpers for saving only the active effect's preset and shared parameters; loading merges only values present in the preset JSON. Preview images are stored alongside presets. Saving with a duplicate name replaces the previous preset and its preview image.
- `effects/` – effect implementations, registry and post-processing helpers.
- `ui/` – browser UI for preview and controls, can modify the `params` which the engine renders.
- `ui/presets.mjs` – helper to fetch preset names and update the UI panel.

## A note on the engine's use of effects

Effects are plugins that declare their own controls and are selected via `params.effect`.
Their values live in `params.effects[effectId]`.
Post-processing modifiers run afterwards via a pipeline defined in `effects/post.mjs`.
Additional modifiers can be registered using `registerPostModifier` to extend the pipeline.
