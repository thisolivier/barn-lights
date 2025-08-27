export async function fetchPresets(win){
  const res = await win.fetch('/presets');
  return res.json();
}

export function renderPresetPanel(doc, container, presets, onSelect){
  container.innerHTML = '';
  presets.forEach(p => {
    const btn = doc.createElement('button');
    btn.className = 'preset';
    const img = doc.createElement('img');
    if (p.img) img.src = p.img;
    img.alt = p.name;
    const label = doc.createElement('span');
    label.textContent = p.name;
    btn.appendChild(img);
    btn.appendChild(label);
    btn.onclick = () => onSelect(p.name);
    container.appendChild(btn);
  });
}

export async function refreshPresetPanel(win, doc, container, onSelect){
  const presets = await fetchPresets(win);
  renderPresetPanel(doc, container, presets, onSelect);
  return presets;
}
