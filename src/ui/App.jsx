import React, { useCallback, useEffect, useState } from 'react';
import { run } from './main.mjs';
import { WebSocketProvider } from './WebSocketContext.js';
import { ParamsProvider } from './ParamsContext.js';
import Renderer from './Renderer.jsx';
import ControlPanel from './ControlPanel.jsx';

export default function App() {
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
      run(runtime.applyLocal, setScene).then(result => {
        setHandlers(result);
        setLayouts({ left: result.layoutLeft, right: result.layoutRight });
      });
    }
  }, [runtime]);

  const { onInit, onParams, onStatus } = handlers || {
    onInit: () => {},
    onParams: () => {},
    onStatus: () => {}
  };

  return (
    <ParamsProvider send={sendFunction} onReady={handleReady}>
      <WebSocketProvider onInit={onInit} onParams={onParams} onError={onStatus} setSend={setSendFunction}>
        {runtime && layouts.left && layouts.right && scene.width && scene.height ? (
          <Renderer
            getParams={runtime.getParams}
            layoutLeft={layouts.left}
            layoutRight={layouts.right}
            sceneWidth={scene.width}
            sceneHeight={scene.height}
          />
        ) : null}
        <ControlPanel />
      </WebSocketProvider>
    </ParamsProvider>
  );
}

