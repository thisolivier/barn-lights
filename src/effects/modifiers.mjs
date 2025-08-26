export const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function applyBrightnessTint(sceneF32, tint, brightness){
  const [tr,tg,tb] = tint; const g = brightness;
  for(let i=0;i<sceneF32.length;i+=3){
    sceneF32[i]   = clamp01(sceneF32[i]  * tr * g);
    sceneF32[i+1] = clamp01(sceneF32[i+1]* tg * g);
    sceneF32[i+2] = clamp01(sceneF32[i+2]* tb * g);
  }
}

export function applyGamma(sceneF32, gamma=1.0){
  if (Math.abs(gamma-1.0)<1e-3) return;
  const inv = 1/gamma;
  for(let i=0;i<sceneF32.length;i++) sceneF32[i] = Math.pow(clamp01(sceneF32[i]), inv);
}

export function applyStrobe(sceneF32, t, hz=0, duty=0.5, low=0.0){
  if (hz<=0) return;
  const period = 1/Math.max(0.001, hz);
  const phase = (t % period)/period;
  const mult = phase < duty ? 1.0 : low;
  if (mult===1) return;
  for(let i=0;i<sceneF32.length;i++) sceneF32[i] *= mult;
}

export function applyRollX(sceneF32, W, H, px){
  const shift = ((px % W)+W)%W;
  if (shift===0) return;
  const rowBytes = W*3;
  for(let y=0;y<H;y++){
    const off = y*rowBytes;
    const src = sceneF32.slice(off, off+rowBytes);
    for(let x=0;x<W;x++){
      const sx = (x+shift)%W;
      sceneF32[off+x*3+0] = src[sx*3+0];
      sceneF32[off+x*3+1] = src[sx*3+1];
      sceneF32[off+x*3+2] = src[sx*3+2];
    }
  }
}

export function bilinearSampleRGB(sceneF32, W, H, sx, sy){
  sx = Math.max(0, Math.min(W-1, sx));
  sy = Math.max(0, Math.min(H-1, sy));
  const x0 = Math.floor(sx), x1 = Math.min(W-1, x0+1);
  const y0 = Math.floor(sy), y1 = Math.min(H-1, y0+1);
  const tx = sx - x0, ty = sy - y0;
  const i00 = (y0*W + x0)*3, i10 = (y0*W + x1)*3, i01 = (y1*W + x0)*3, i11 = (y1*W + x1)*3;
  const L = (a,b,t)=> a + (b-a)*t;
  return [
    L(L(sceneF32[i00],   sceneF32[i10],   tx), L(sceneF32[i01],   sceneF32[i11],   tx), ty),
    L(L(sceneF32[i00+1], sceneF32[i10+1], tx), L(sceneF32[i01+1], sceneF32[i11+1], tx), ty),
    L(L(sceneF32[i00+2], sceneF32[i10+2], tx), L(sceneF32[i01+2], sceneF32[i11+2], tx), ty),
  ];
}

export function sliceSection(sceneF32, W, H, section, sampling, totalWidth = sampling.width, offset = 0){
  const out = new Uint8Array(section.led_count*3);
  for (let i=0;i<section.led_count;i++){
    const t = section.led_count>1 ? i/(section.led_count-1) : 0;
    const xNorm = section.x0 + (section.x1 - section.x0) * t + offset;
    const yNorm = section.y;
    const sx = (xNorm / totalWidth)  * (W-1);
    const sy = (yNorm / sampling.height) * (H-1);
    const [r,g,b] = bilinearSampleRGB(sceneF32, W, H, sx, sy);
    const j = i*3;
    out[j]   = Math.round(clamp01(r) * 255);
    out[j+1] = Math.round(clamp01(g) * 255);
    out[j+2] = Math.round(clamp01(b) * 255);
  }
  return out;
}
