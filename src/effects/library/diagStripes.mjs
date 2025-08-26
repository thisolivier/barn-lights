const defaultColorA = [1.0, 1.0, 1.0];
const defaultColorB = [0.0, 0.0, 0.0];

export const id = 'diagStripes';
export const displayName = 'Diagonal Stripes';
export const defaultParams = {
  stripeWidth: 32,
  colorA: defaultColorA,
  colorB: defaultColorB,
};
export const paramSchema = {
  stripeWidth: { type: 'number', min: 1, max: 128, step: 1 },
  colorA: { type: 'color' },
  colorB: { type: 'color' },
};

export function render(sceneF32, W, H, t, params){
  const { stripeWidth = 32, colorA = defaultColorA, colorB = defaultColorB } = params;
  for (let y=0; y<H; y++){
    for (let x=0; x<W; x++){
      const stripe = Math.floor((x + y) / stripeWidth) % 2;
      const rgb = stripe === 0 ? colorA : colorB;
      const i = (y*W + x) * 3;
      sceneF32[i] = rgb[0];
      sceneF32[i+1] = rgb[1];
      sceneF32[i+2] = rgb[2];
    }
  }
}
