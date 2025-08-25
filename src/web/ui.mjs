const controls = [
  "fpsCap", "mirrorWalls", "brightness", "gamma", "rollPx",
  "strobeHz", "strobeDuty", "strobeLow", "gradPhase"
];

export function applyUI(doc, params) {
  const effect = doc.getElementById("effect");
  if (effect && effect.value !== params.effect) effect.value = params.effect;
  for (const k of controls) {
    const el = doc.getElementById(k);
    const span = doc.getElementById(k + "_v");
    if (!el) continue;
    if (el.type === "checkbox") el.checked = !!params[k];
    else { el.value = params[k]; if (span) span.textContent = params[k]; }
  }
  ["tintR", "tintG", "tintB"].forEach((id, i) => {
    const el = doc.getElementById(id);
    const span = doc.getElementById(id + "_v");
    if (!el) return;
    el.value = params.tint[i];
    if (span) span.textContent = params.tint[i];
  });
}

export function initUI(doc, params, send, toggleFreeze) {
  const win = doc.defaultView || globalThis;
  const effect = doc.getElementById("effect");
  effect.value = params.effect;
  effect.onchange = () => { params.effect = effect.value; send({ effect: effect.value }); };

  for (const k of controls) {
    const el = doc.getElementById(k);
    const span = doc.getElementById(k + "_v");
    if (!el) continue;
    if (el.type === "checkbox") {
      el.checked = !!params[k];
      el.oninput = () => { params[k] = el.checked; send({ [k]: el.checked }); };
    } else {
      el.value = params[k];
      if (span) span.textContent = params[k];
      el.oninput = () => {
        params[k] = parseFloat(el.value);
        if (span) span.textContent = el.value;
        send({ [k]: params[k] });
      };
    }
  }

  ["tintR", "tintG", "tintB"].forEach((id, i) => {
    const el = doc.getElementById(id);
    const span = doc.getElementById(id + "_v");
    el.value = params.tint[i];
    if (span) span.textContent = params.tint[i];
    el.oninput = () => {
      params.tint[i] = parseFloat(el.value);
      if (span) span.textContent = el.value;
      send({ tint: params.tint });
    };
  });

  win.addEventListener("keydown", (e) => {
    if (e.key === "1") effect.value = "gradient", effect.onchange();
    if (e.key === "2") effect.value = "solid", effect.onchange();
    if (e.key === "3") effect.value = "fire", effect.onchange();
    if (e.key.toLowerCase() === "b") { params.brightness = 0; send({ brightness: 0 }); }
    if (e.key === " ") toggleFreeze();
  });

  applyUI(doc, params);
}
