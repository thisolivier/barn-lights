# Effect Library

One file per visual effect. Each module exports the following:
`{ id, displayName, defaultParams, paramSchema, render }`.
Note that this includes its own render function, and parameters for modification.

## Gradient

Renders a horizontal gradient between defined color stops. The `reverse` parameter
flips the gradient direction.
