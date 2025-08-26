const clamp01 = (x)=>Math.max(0, Math.min(1, x));

export const id = 'diagonalStripes';
export const displayName = 'Diagonal Stripes';
export const defaultParams = {
  stripeWidth: 32,
  onColor: [1.0, 1.0, 1.0],
  offColor: [0.0, 0.0, 0.0]
};
export const paramSchema = {
  stripeWidth: { type: 'number', min: 1, max: 256, step: 1 },
  onColor: { type: 'color' },
  offColor: { type: 'color' },
};

export function render(sceneF32, W, H, t, params){
  const { stripeWidth=32, onColor=[1,1,1], offColor=[0,0,0] } = params;
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const stripe = Math.floor((x + y) / stripeWidth) % 2;
      const c = stripe ? onColor : offColor;
      const i=(y*W+x)*3;
      sceneF32[i] = clamp01(c[0]);
      sceneF32[i+1] = clamp01(c[1]);
      sceneF32[i+2] = clamp01(c[2]);
    }
  }
}
