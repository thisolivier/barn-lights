import React, { useEffect, useState } from 'react';
import { run } from './main.mjs';
import { WebSocketProvider } from './WebSocketContext.js';

export default function App() {
  const [handlers, setHandlers] = useState(null);

  useEffect(() => {
    run().then(setHandlers);
  }, []);

  if (!handlers) return null;

  const { onInit, onParams, onStatus, setSend } = handlers;

  return (
    <WebSocketProvider onInit={onInit} onParams={onParams} onError={onStatus} setSend={setSend}>
      {null}
    </WebSocketProvider>
  );
}

