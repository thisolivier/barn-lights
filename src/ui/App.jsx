import React, { useCallback, useEffect, useState } from 'react';
import { run } from './main.mjs';
import { WebSocketProvider } from './WebSocketContext.js';
import { ParamsProvider } from './ParamsContext.js';

export default function App() {
  const [handlers, setHandlers] = useState(null);
  const [sendFunction, setSendFunction] = useState(() => {});
  const [runtime, setRuntime] = useState(null);

  const handleReady = useCallback((runtimeValue) => {
    setRuntime(runtimeValue);
  }, []);

  useEffect(() => {
    if (runtime) {
      run(runtime.applyLocal, runtime.getParams).then(setHandlers);
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
        {null}
      </WebSocketProvider>
    </ParamsProvider>
  );
}

