# Effect Library

One file per visual effect. Each module exports the following:
`{ id, displayName, defaultParams, paramSchema, render }`.
Note that this includes its own render function, and parameters for modification.

Available effects include `gradient`, `solid`, `fire`, `digitalRain`, and the shader-based `fireShader`.
The `digitalRain` effect now supports a configurable background color and drop gradient.
The `gradient` effect supports arbitrary color stops for flexible palettes.

A shared `gradient-utils.mjs` module provides helpers to sort color stops and sample colors along a gradient.
