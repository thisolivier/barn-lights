import React, { useEffect } from 'react';
import { run } from './main.mjs';

export default function App() {
  useEffect(() => {
    run();
  }, []);
  return null;
}

