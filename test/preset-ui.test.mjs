import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshPresetPanel } from '../src/ui/presets.mjs';

test('preset panel matches fetched items', async () => {
  const items = [{ name: 'one', img: 'a' }, { name: 'two', img: 'b' }];
  const win = { fetch: async () => ({ json: async () => items }) };
  const doc = {
    createElement(tag){
      return {
        tag,
        children: [],
        className: '',
        src: '',
        alt: '',
        textContent: '',
        onclick: null,
        appendChild(child){ this.children.push(child); }
      };
    }
  };
  const container = {
    innerHTML: '',
    children: [],
    appendChild(el){ this.children.push(el); }
  };
  await refreshPresetPanel(win, doc, container, () => {});
  assert.equal(container.children.length, items.length);
  assert.deepEqual(container.children.map(c => c.children[1].textContent), items.map(i => i.name));
});
