import React, { useCallback, useEffect, useState } from 'react';
import { run } from './main.mjs';
import { WebSocketProvider } from './WebSocketContext.js';
import { ParamsProvider } from './ParamsContext.js';
import Renderer from './Renderer.jsx';

export default function App() {
  const [handlers, setHandlers] = useState(null);
  const [sendFunction, setSendFunction] = useState(() => {});
  const [runtime, setRuntime] = useState(null);
  const [layouts, setLayouts] = useState({ left: null, right: null });
  const [scene, setScene] = useState({ width: 0, height: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  const handleReady = useCallback((runtimeValue) => {
    setRuntime(runtimeValue);
  }, []);

  useEffect(() => {
    if (!runtime) return;
    let cancelled = false;
    run(runtime.applyLocal, setScene)
      .then((result) => {
        if (cancelled) return;
        setHandlers(result);
        setLayouts({ left: result.layoutLeft, right: result.layoutRight });
        if (!result.layoutLeft || !result.layoutRight) {
          setErrorMessage('Failed to load layouts');
        }
      })
      .catch((error) => {
        console.error('Failed to initialize', error);
        if (!cancelled) setErrorMessage('Failed to initialize application');
      });
    return () => {
      cancelled = true;
    };
  }, [runtime]);

  const { onInit, onParams, onStatus } = handlers || {
    onInit: () => {},
    onParams: () => {},
    onStatus: () => {}
  };

  const handleWebSocketError = useCallback((message) => {
    onStatus(message);
    setErrorMessage(message);
  }, [onStatus]);

  let content = null;
  if (errorMessage) {
    content = <div>{errorMessage}</div>;
  } else if (!handlers) {
    content = <div>Loading...</div>;
  } else {
    content = (
      <WebSocketProvider onInit={onInit} onParams={onParams} onError={handleWebSocketError} setSend={setSendFunction}>
        {layouts.left && layouts.right && scene.width && scene.height ? (
          <Renderer
            getParams={runtime.getParams}
            layoutLeft={layouts.left}
            layoutRight={layouts.right}
            sceneWidth={scene.width}
            sceneHeight={scene.height}
          />
        ) : (
          <div>Loading preview...</div>
        )}
      </WebSocketProvider>
    );
  }

  return (
    <ParamsProvider send={sendFunction} onReady={handleReady}>
      {content}
    </ParamsProvider>
  );
}

