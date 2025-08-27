import * as gradient from './library/gradient.mjs';
import * as solid from './library/solid.mjs';
import * as fire from './library/fire.mjs';
import * as fireShader from './library/fireShader.mjs';
import * as digitalRain from './library/digitalRain.mjs';
import * as diagonalStripes from './library/diagonalStripes.mjs';
import * as plasma from './library/plasma.mjs';

export const effects = {
  [gradient.id]: gradient,
  [solid.id]: solid,
  [fire.id]: fire,
  [fireShader.id]: fireShader,
  [digitalRain.id]: digitalRain,
  [diagonalStripes.id]: diagonalStripes,
  [plasma.id]: plasma,
};
