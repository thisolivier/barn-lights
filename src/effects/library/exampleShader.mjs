let createGl;
if (typeof document === 'undefined'){
  ({ default: createGl } = await import('gl'));
}

async function loadShaderSource(shaderFileName){
  if (typeof document === 'undefined'){
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const directoryName = dirname(fileURLToPath(import.meta.url));
    return readFile(join(directoryName, shaderFileName), 'utf8');
  }
  const response = await fetch(new URL(shaderFileName, import.meta.url));
  return response.text();
}

const vertexShaderSource = await loadShaderSource('exampleShader.vertex.glsl');
const fragmentShaderSource = await loadShaderSource('exampleShader.fragment.glsl');

export const id = 'exampleShader';
export const displayName = 'Example Shader';
export const defaultParams = {
  strobeSpeed: 2,
  colorA: [0.0, 0.0, 0.0],
  colorB: [1.0, 1.0, 1.0],
};
export const paramSchema = {
  strobeSpeed: { type: 'number', min: 0.1, max: 30, step: 0.1, label: 'Strobe Speed' },
  colorA: { type: 'color', label: 'Color A' },
  colorB: { type: 'color', label: 'Color B' },
};

let glContext = null;
let shaderProgram = null;
let positionBuffer = null;

function createWebGlContext(sceneWidth, sceneHeight){
  if (typeof document === 'undefined'){
    return createGl ? createGl(sceneWidth, sceneHeight, { preserveDrawingBuffer: true }) : null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = sceneWidth;
  canvas.height = sceneHeight;
  return canvas.getContext('webgl', { preserveDrawingBuffer: true });
}

function initializeContext(sceneWidth, sceneHeight){
  glContext = createWebGlContext(sceneWidth, sceneHeight);
  if (!glContext){
    shaderProgram = null;
    positionBuffer = null;
    return;
  }
  const renderingContext = glContext;
  const vertexShader = renderingContext.createShader(renderingContext.VERTEX_SHADER);
  renderingContext.shaderSource(vertexShader, vertexShaderSource);
  renderingContext.compileShader(vertexShader);
  const fragmentShader = renderingContext.createShader(renderingContext.FRAGMENT_SHADER);
  renderingContext.shaderSource(fragmentShader, fragmentShaderSource);
  renderingContext.compileShader(fragmentShader);
  shaderProgram = renderingContext.createProgram();
  renderingContext.attachShader(shaderProgram, vertexShader);
  renderingContext.attachShader(shaderProgram, fragmentShader);
  renderingContext.linkProgram(shaderProgram);

  positionBuffer = renderingContext.createBuffer();
  renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, positionBuffer);
  renderingContext.bufferData(
    renderingContext.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]),
    renderingContext.STATIC_DRAW,
  );
}

export function render(sceneFloat32, sceneWidth, sceneHeight, elapsedSeconds, userParams = {}){
  const {
    strobeSpeed = defaultParams.strobeSpeed,
    colorA = defaultParams.colorA,
    colorB = defaultParams.colorB,
  } = userParams;
  if (!glContext || glContext.drawingBufferWidth !== sceneWidth || glContext.drawingBufferHeight !== sceneHeight){
    initializeContext(sceneWidth, sceneHeight);
  }
  if (!glContext){
    const phase = (elapsedSeconds * strobeSpeed) % 1;
    const chosenColor = phase >= 0.5 ? colorB : colorA;
    for (let sceneOffset = 0; sceneOffset < sceneFloat32.length; sceneOffset += 3){
      sceneFloat32[sceneOffset] = chosenColor[0];
      sceneFloat32[sceneOffset + 1] = chosenColor[1];
      sceneFloat32[sceneOffset + 2] = chosenColor[2];
    }
    return;
  }
  const renderingContext = glContext;
  renderingContext.viewport(0, 0, sceneWidth, sceneHeight);
  renderingContext.useProgram(shaderProgram);
  renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, positionBuffer);
  const positionLocation = renderingContext.getAttribLocation(shaderProgram, 'position');
  renderingContext.enableVertexAttribArray(positionLocation);
  renderingContext.vertexAttribPointer(positionLocation, 2, renderingContext.FLOAT, false, 0, 0);
  renderingContext.uniform1f(renderingContext.getUniformLocation(shaderProgram, 'elapsed'), elapsedSeconds);
  renderingContext.uniform1f(renderingContext.getUniformLocation(shaderProgram, 'strobeSpeed'), strobeSpeed);
  renderingContext.uniform3fv(renderingContext.getUniformLocation(shaderProgram, 'colorA'), colorA);
  renderingContext.uniform3fv(renderingContext.getUniformLocation(shaderProgram, 'colorB'), colorB);
  renderingContext.drawArrays(renderingContext.TRIANGLES, 0, 6);

  const pixelBuffer = new Uint8Array(sceneWidth * sceneHeight * 4);
  renderingContext.readPixels(0, 0, sceneWidth, sceneHeight, renderingContext.RGBA, renderingContext.UNSIGNED_BYTE, pixelBuffer);
  for (let pixelOffset = 0, sceneOffset = 0; sceneOffset < sceneFloat32.length; pixelOffset += 4, sceneOffset += 3){
    sceneFloat32[sceneOffset] = pixelBuffer[pixelOffset] / 255;
    sceneFloat32[sceneOffset + 1] = pixelBuffer[pixelOffset + 1] / 255;
    sceneFloat32[sceneOffset + 2] = pixelBuffer[pixelOffset + 2] / 255;
  }
}
