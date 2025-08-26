# Effect Library

One file per visual effect. Each module exports the following:
`{ id, displayName, defaultParams, paramSchema, render }`.
Note that this includes its own render function, and parameters for modification.

Available effects include `gradient`, `solid`, `fire`, and the CSS-driven `fireCss` with adjustable rotation, color gradient, flame count, and speed control.
