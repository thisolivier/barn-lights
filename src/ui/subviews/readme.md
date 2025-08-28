# Subviews

Dynamic UI widgets for effect parameters.

- `index.js` – exports `EffectControls` and inline React widgets for numbers, checkboxes, buttons, enums, colors, and color stop editors.

The `gradient` effect uses the `colorStops` widget to define its color palette. The widget keeps its Grapick picker in sync with parameter changes such as loading presets.

Utilities for RGB conversions live in `utils.mjs`.
