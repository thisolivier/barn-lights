import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(url, { onInit, onParams, onError } = {}) {
  const socketRef = useRef(null);
  const [readyState, setReadyState] = useState('closed');

  const send = useCallback((obj) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(obj));
    }
  }, []);

  useEffect(() => {
    let socket = null;
    const timer = setTimeout(() => {
      try {
        socket = new WebSocket(url);
        socketRef.current = socket;
        setReadyState('connecting');

        socket.onerror = (event) => {
          console.error('WebSocket error', event);
          setReadyState('error');
          if (onError) onError('WebSocket connection error');
        };

        socket.onclose = (event) => {
          console.warn('WebSocket closed', event);
          setReadyState('closed');
          if (onError) onError('WebSocket connection closed');
        };

        socket.onopen = () => {
          setReadyState('open');
        };

        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'init' && onInit) onInit(message);
          if (message.type === 'params' && onParams) onParams(message);
        };
      } catch (err) {
        console.error('Failed to create WebSocket', err);
        setReadyState('error');
        if (onError) onError('Failed to connect to server');
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      if (socket) socket.close();
    };
  }, [url, onInit, onParams, onError]);

  return { readyState, send };
}
