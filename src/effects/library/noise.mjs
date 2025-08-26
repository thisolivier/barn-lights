import { clamp01 } from '../modifiers.mjs';

const mix = (a,b,t)=> a + (b-a)*t;
const mix3 = (A,B,t)=> [mix(A[0],B[0],t), mix(A[1],B[1],t), mix(A[2],B[2],t)];
function vnoise2(x,y){
  return 0.5 + 0.5 * Math.sin( (x*12.9898 + y*78.233) * 43758.5453 );
}
function fbm(x,y,oct=4){
  let a=0, f=1, amp=0.5;
  for(let i=0;i<oct;i++){ a += amp*vnoise2(x*f,y*f); f*=2; amp*=0.5; }
  return a;
}

export const id = 'noise';
export const displayName = 'Noise';
export const defaultParams = {
  noiseSpeed: 0.35,
  noiseScale: 2.2,
  noiseIntensity: 1.2,
};
export const paramSchema = {
  noiseSpeed:     { type: 'number', min: 0, max: 5, step: 0.01, label: 'Speed' },
  noiseScale:     { type: 'number', min: 0.5, max: 10, step: 0.1, label: 'Scale' },
  noiseIntensity: { type: 'number', min: 0, max: 3, step: 0.01, label: 'Intensity' },
};

export function render(sceneF32, W, H, t, params){
  const { noiseSpeed=0.35, noiseScale=2.2, noiseIntensity=1.2 } = params;
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const n = fbm(x/(W/noiseScale), (y/(H/noiseScale)) - t*noiseSpeed, 4);
      const heat = Math.pow(clamp01(n*1.2 - (1 - y/H)*0.6), 1.2) * noiseIntensity;
      let rgb;
      if (heat < 0.33)      rgb = mix3([0,0,0],[1,0,0], heat/0.33);
      else if (heat<0.66)   rgb = mix3([1,0,0],[1,0.5,0], (heat-0.33)/0.33);
      else                  rgb = mix3([1,0.5,0],[1,1,1], (heat-0.66)/0.34);
      const i=(y*W+x)*3;
      sceneF32[i]=rgb[0]; sceneF32[i+1]=rgb[1]; sceneF32[i+2]=rgb[2];
    }
  }
}
