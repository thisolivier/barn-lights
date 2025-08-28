import React, { useCallback, useEffect, useState } from 'react';
import { run as defaultRun } from './main.mjs';
import { WebSocketProvider } from './WebSocketContext.js';
import { ParamsProvider } from './ParamsContext.js';
import ControlPanel from './ControlPanel.jsx';
import CanvasPreview from './CanvasPreview.js';

export default function App({
  runFunction = defaultRun,
  renderFrame,
  shouldAnimate = true,
  ParamsProviderComponent = ParamsProvider,
  WebSocketProviderComponent = WebSocketProvider
}) {
  const [handlers, setHandlers] = useState(null);
  const [sendFunction, setSendFunction] = useState(() => {});
  const [runtime, setRuntime] = useState(null);
  const [layouts, setLayouts] = useState({ left: null, right: null });
  const [scene, setScene] = useState({ width: 0, height: 0 });

  const handleReady = useCallback((runtimeValue) => {
    setRuntime(runtimeValue);
  }, []);

  useEffect(() => {
    if (runtime) {
      runFunction(runtime.applyLocal, setScene).then(result => {
        setHandlers(result);
        setLayouts({ left: result.layoutLeft, right: result.layoutRight });
      });
    }
  }, [runtime, runFunction]);

  const { onInit, onParams, onStatus } = handlers || {
    onInit: () => {},
    onParams: () => {},
    onStatus: () => {}
  };

  return React.createElement(
    ParamsProviderComponent,
    { send: sendFunction, onReady: handleReady },
    React.createElement(
      WebSocketProviderComponent,
      { onInit, onParams, onError: onStatus, setSend: setSendFunction },
      [ 
        (runtime && layouts.left && layouts.right && scene.width && scene.height
        ? React.createElement(CanvasPreview, {
            getParams: runtime.getParams,
            layoutLeft: layouts.left,
            layoutRight: layouts.right,
            sceneWidth: scene.width,
            sceneHeight: scene.height,
            renderFrame,
            shouldAnimate
          })
        : null), 
        React.createElement(ControlPanel, {
          key: "control"
          // pass props here if ControlPanel expects any
        })
      ]
    )
  );
}

