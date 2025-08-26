# Effect Library

One file per visual effect. Each module exports the following:
`{ id, displayName, defaultParams, paramSchema, render }`.
Note that this includes its own render function, and prameters for modification.

## Available effects

- `gradient.mjs` – linear color blend between two colors.
- `solid.mjs` – single color fill.
- `fire.mjs` – CPU fire simulation.
- `fireShader.mjs` – WebGL fire shader with parameters:
  - `speed` – upward scroll speed.
  - `angle` – rotation of the noise field in radians.
  - `flameHeight` – fade height of flames.
  - `colorStops` – gradient of colors applied to the heat value.