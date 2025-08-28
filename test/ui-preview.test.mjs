import test from 'node:test';
import assert from 'node:assert/strict';
import babelRegister from '@babel/register';
babelRegister({ extensions: ['.js', '.jsx'], presets: ['@babel/preset-react'] });
import React from 'react';
import ReactDOM from 'react-dom/client';
import { JSDOM } from 'jsdom';
const App = (await import('../src/ui/App.js')).default;

function createMockContext(){
  return {
    canvas: { width: 1, height: 1 },
    lastImageData: null,
    createImageData(width, height){
      return { width, height, data: new Uint8ClampedArray(width * height * 4) };
    },
    putImageData(imageData){
      this.lastImageData = imageData;
    },
    beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fillRect(){},
    imageSmoothingEnabled: true
  };
}

test('react app renders canvas via simulated engine and frame drawer', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.performance = dom.window.performance;
  global.location = dom.window.location;
  global.WebSocket = class { constructor(){ this.readyState = 1; } send(){} close(){} };
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = (fn, ms, ...args) => originalSetTimeout(fn, 0, ...args);

  const leftContext = createMockContext();
  const rightContext = createMockContext();
  dom.window.HTMLCanvasElement.prototype.getContext = function(){
    return this.id === 'left' ? leftContext : rightContext;
  };

  const fakeRun = async (applyLocal, setScene) => {
    applyLocal({});
    setScene({ width: 1, height: 1 });
    const layout = { runs: [], sampling: { width: 1, height: 1 } };
    return { onInit: ()=>{}, onParams: ()=>{}, onStatus: ()=>{}, layoutLeft: layout, layoutRight: layout };
  };

  const fakeRenderFrame = (
    win,
    contextLeft,
    contextRight,
    leftFrame,
    rightFrame
  ) => {
    const pixel = new Uint8ClampedArray([255,0,0,255]);
    contextLeft.putImageData({ width:1, height:1, data: pixel });
    contextRight.putImageData({ width:1, height:1, data: pixel });
  };

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);
  function StubParamsProvider({ children, onReady }) {
    React.useEffect(() => {
      if (onReady) onReady({ getParams: () => ({}), applyLocal: () => {}, dispatch: () => {} });
    }, [onReady]);
    return children;
  }
  function StubWebSocketProvider({ children, setSend }) {
    React.useEffect(() => {
      if (setSend) setSend(() => {});
    }, [setSend]);
    return children;
  }
  root.render(React.createElement(App, {
    runFunction: fakeRun,
    renderFrame: fakeRenderFrame,
    shouldAnimate: false,
    ParamsProviderComponent: StubParamsProvider,
    WebSocketProviderComponent: StubWebSocketProvider
  }));
  for (let index = 0; index < 5 && document.querySelectorAll('canvas').length < 2; index++) {
    await new Promise(resolve => originalSetTimeout(resolve, 0));
  }
  await new Promise(resolve => originalSetTimeout(resolve, 0));

  const canvases = document.querySelectorAll('canvas');
  assert.equal(canvases.length, 2);
  assert.deepEqual(Array.from(leftContext.lastImageData.data), [255,0,0,255]);
  root.unmount();
  global.setTimeout = originalSetTimeout;
});
