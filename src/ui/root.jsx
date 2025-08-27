import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { run } from './main.mjs';

function Application() {
  useEffect(() => {
    run();
  }, []);
  return null;
}

const containerElement = document.getElementById('root');
const reactRoot = createRoot(containerElement);
reactRoot.render(<Application />);

