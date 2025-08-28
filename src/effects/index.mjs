import * as gradient from './library/gradient.mjs';
import * as solid from './library/solid.mjs';
import * as noise from './library/noise.mjs';
import * as digitalRain from './library/digitalRain.mjs';
import * as diagonalStripes from './library/diagonalStripes.mjs';
import * as exampleShader from './library/exampleShader.mjs';

export const effects = {
  [gradient.id]: gradient,
  [solid.id]: solid,
  [noise.id]: noise,
  [digitalRain.id]: digitalRain,
  [diagonalStripes.id]: diagonalStripes,
  [exampleShader.id]: exampleShader,
};
