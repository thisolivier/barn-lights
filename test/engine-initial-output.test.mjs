import test from 'node:test';
import assert from 'assert/strict';
import { spawn } from 'child_process';
import { once } from 'events';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('first stdout line is NDJSON', async () => {
  const proc = spawn('node', ['bin/engine.mjs'], { cwd: ROOT });
  const rl = createInterface({ input: proc.stdout });
  const iter = rl[Symbol.asyncIterator]();
  const { value: first } = await iter.next();
  proc.kill();
  await once(proc, 'exit');
  assert.ok(first.startsWith('{'), `First line was: ${first}`);
});
