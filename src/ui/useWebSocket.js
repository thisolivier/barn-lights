import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export function useWebSocket({ onInit, onParams, onError } = {}) {
  const webSocketRef = useRef(null);
  const [connectionState, setConnectionState] = useState('connecting');

  const send = (dataObject) => {
    if (webSocketRef.current && webSocketRef.current.readyState === 1) {
      webSocketRef.current.send(JSON.stringify(dataObject));
    }
  };

  useEffect(() => {
    const windowObject = globalThis;
    try {
      const webSocket = new windowObject.WebSocket(`ws://${windowObject.location.host}`);
      webSocketRef.current = webSocket;
      webSocket.onerror = (event) => {
        console.error('WebSocket error', event);
        setConnectionState('error');
        if (onError) onError('WebSocket connection error');
      };
      webSocket.onclose = (event) => {
        console.warn('WebSocket closed', event);
        setConnectionState('closed');
        if (onError) onError('WebSocket connection closed');
      };
      webSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'init' && onInit) onInit(message, send);
        if (message.type === 'params' && onParams) onParams(message);
      };
      webSocket.onopen = () => setConnectionState('open');
    } catch (error) {
      console.error('Failed to create WebSocket', error);
      setConnectionState('error');
      if (onError) onError('Failed to connect to server');
    }
    return () => {
      if (webSocketRef.current) webSocketRef.current.close();
    };
  }, [onInit, onParams, onError]);

  return { state: connectionState, send };
}

export const WebSocketContext = createContext({ state: 'closed', send: () => {} });

export function WebSocketProvider({ children, onInit, onParams, onError }) {
  const connection = useWebSocket({ onInit, onParams, onError });
  return React.createElement(WebSocketContext.Provider, { value: connection }, children);
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}

