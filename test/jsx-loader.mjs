import { readFile } from 'node:fs/promises';
import { transformAsync } from '@babel/core';

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.js') && !url.includes('node_modules')) {
    const source = await readFile(new URL(url), 'utf8');
    const { code } = await transformAsync(source, { presets: ['@babel/preset-react'] });
    return { format: 'module', source: code, shortCircuit: true };
  }
  return defaultLoad(url, context, defaultLoad);
}
