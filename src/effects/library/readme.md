# Effect Library

One file per visual effect. Each module exports the following:
`{ id, displayName, defaultParams, paramSchema, render }`.
Note that this includes its own render function, and parameters for modification.

- `exampleShader.mjs` – WebGL fragment shader that alternates between two colors at a configurable speed.