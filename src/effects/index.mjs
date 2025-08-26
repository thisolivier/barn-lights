import * as gradient from './library/gradient.mjs';
import * as solid from './library/solid.mjs';
import * as fire from './library/fire.mjs';
import * as fireCss from './library/fireCss.mjs';
import * as fireShader from './library/fireShader.mjs';

export const effects = {
  [gradient.id]: gradient,
  [solid.id]: solid,
  [fire.id]: fire,
  [fireCss.id]: fireCss,
  [fireShader.id]: fireShader,
};
