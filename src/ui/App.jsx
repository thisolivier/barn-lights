import React, { useEffect, useState } from 'react';
import { run } from './main.mjs';
import { WebSocketProvider } from './useWebSocket.js';

export default function App() {
  const [handlers, setHandlers] = useState(null);

  useEffect(() => {
    run().then(setHandlers);
  }, []);

  if (!handlers) return null;

  return <WebSocketProvider {...handlers} />;
}

