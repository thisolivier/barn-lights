# Effect Library

One file per visual effect. Each module exports the following:
`{ id, displayName, defaultParams, paramSchema, render }`.
Note that this includes its own render function, and parameters for modification.

Available effects include `gradient`, `solid`, `fire`, the shader-based `fireShader`, and `diagonalStripes` for testing alignment with bold diagonal bands.