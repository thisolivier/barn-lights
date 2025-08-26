// WebGL-based fire shader effect

export const id = 'fire2';
export const displayName = 'Fire Shader';
export const defaultParams = {
  speed: 1.0,
  angle: 0.0,
  flameHeight: 1.0,
  colorStops: [
    { pos: 0.0, color: [0, 0, 0] },
    { pos: 0.3, color: [1, 0, 0] },
    { pos: 0.7, color: [1, 0.8, 0] },
    { pos: 1.0, color: [1, 1, 1] },
  ],
};
export const paramSchema = {
  speed:       { type: 'number', min: 0, max: 5, step: 0.01 },
  angle:       { type: 'number', min: -3.1416, max: 3.1416, step: 0.01 },
  flameHeight: { type: 'number', min: 0.1, max: 2, step: 0.01 },
  colorStops:  { type: 'colorStops' },
};

// ------- WebGL setup -------
let gl = null, prog = null, canvas = null, loc = null;
const SIZE = 64; // small offscreen canvas

function initGL() {
  if (gl) return;
  canvas = globalThis.OffscreenCanvas ?
    new OffscreenCanvas(SIZE, SIZE) :
    (globalThis.document ? document.createElement('canvas') : null);
  if (!canvas) return;
  canvas.width = SIZE; canvas.height = SIZE;
  gl = canvas.getContext('webgl');
  if (!gl) return;

  const vsSrc = `
    attribute vec2 aPos;
    void main(){ gl_Position = vec4(aPos,0.0,1.0); }
  `;

  const fsSrc = `
    precision mediump float;
    uniform vec2 uRes;
    uniform float uTime,uSpeed,uAngle,uFlameHeight;
    const int MAX_STOPS=8;
    uniform int uStopCount;
    uniform float uStopPos[MAX_STOPS];
    uniform vec3 uStopColor[MAX_STOPS];

    vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289((x*34.0+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1 = x0.x>x0.y ? vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      vec3 p = permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0*fract(p* C.www)-1.0;
      vec3 h = abs(x)-0.5;
      vec3 ox = floor(x+0.5);
      vec3 a0 = x-ox;
      m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
      vec3 g;
      g.x  = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0*dot(m,g);
    }

    vec3 getColor(float t){
      vec3 col = uStopColor[0];
      for(int i=1;i<MAX_STOPS;i++){
        if(i>=uStopCount) break;
        float p0=uStopPos[i-1];
        float p1=uStopPos[i];
        if(t<=p0) return uStopColor[i-1];
        if(t<p1){
          float f=(t-p0)/(p1-p0);
          return mix(uStopColor[i-1],uStopColor[i],f);
        }
      }
      return uStopColor[uStopCount-1];
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      uv -= 0.5;
      float s=sin(uAngle), c=cos(uAngle);
      uv = mat2(c,-s,s,c)*uv;
      uv += 0.5;
      uv.y += uTime*uSpeed;
      float n = snoise(uv*3.0);
      float mask = clamp(1.0 - uv.y/uFlameHeight, 0.0, 1.0);
      float heat = clamp(n*mask,0.0,1.0);
      vec3 col = getColor(heat);
      gl_FragColor = vec4(col,1.0);
    }
  `;

  function compile(type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  loc = {
    uRes: gl.getUniformLocation(prog,'uRes'),
    uTime: gl.getUniformLocation(prog,'uTime'),
    uSpeed: gl.getUniformLocation(prog,'uSpeed'),
    uAngle: gl.getUniformLocation(prog,'uAngle'),
    uFlameHeight: gl.getUniformLocation(prog,'uFlameHeight'),
    uStopCount: gl.getUniformLocation(prog,'uStopCount'),
    uStopPos: gl.getUniformLocation(prog,'uStopPos'),
    uStopColor: gl.getUniformLocation(prog,'uStopColor'),
  };
}

// ------- render -------
export function render(sceneF32, W, H, t, params){
  const { speed=1, angle=0, flameHeight=1, colorStops=[] } = params;
  initGL();
  if (!gl) { sceneF32.fill(0); return; }

  gl.viewport(0,0,SIZE,SIZE);
  gl.useProgram(prog);
  gl.uniform2f(loc.uRes, SIZE, SIZE);
  gl.uniform1f(loc.uTime, t);
  gl.uniform1f(loc.uSpeed, speed);
  gl.uniform1f(loc.uAngle, angle);
  gl.uniform1f(loc.uFlameHeight, flameHeight);

  const MAX=8;
  const pos = new Float32Array(MAX);
  const col = new Float32Array(MAX*3);
  const count = Math.min(colorStops.length, MAX);
  for(let i=0;i<count;i++){
    const stop = colorStops[i];
    pos[i] = stop.pos ?? 0;
    const c = stop.color || [0,0,0];
    col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
  }
  for(let i=count;i<MAX;i++){
    pos[i] = pos[count-1] || 1;
    const c = colorStops[count-1]?.color || [1,1,1];
    col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
  }
  gl.uniform1i(loc.uStopCount, count);
  gl.uniform1fv(loc.uStopPos, pos);
  gl.uniform3fv(loc.uStopColor, col);

  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  const pixels = new Uint8Array(SIZE*SIZE*4);
  gl.readPixels(0,0,SIZE,SIZE,gl.RGBA,gl.UNSIGNED_BYTE,pixels);

  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const px = Math.floor(x*SIZE/W);
      const py = Math.floor(y*SIZE/H);
      const p = (py*SIZE+px)*4;
      const i = (y*W+x)*3;
      sceneF32[i]   = pixels[p]   /255;
      sceneF32[i+1] = pixels[p+1] /255;
      sceneF32[i+2] = pixels[p+2] /255;
    }
  }
}

