// Rendering is handled by a React component; this module only manages layout and handlers.

function setStatus(doc, msg){
  const el = doc.getElementById("status");
  if (el) el.textContent = msg;
}

async function loadLightLayout(win, doc, side){
  try {
    return await (await win.fetch(`/layout/${side}`)).json();
  } catch (err) {
    console.error(`Failed to load ${side} layout`, err);
    setStatus(doc, `Failed to load ${side} layout`);
    return null;
  }
}

export async function run(applyLocal, setSceneInfo, docArg = globalThis.document){
  const doc = docArg;
  const win = docArg.defaultView || globalThis;

  const [layoutLeft, layoutRight] = await Promise.all([
    loadLightLayout(win, doc, "left"),
    loadLightLayout(win, doc, "right")
  ]);

  const onInit = (msg) => {
    applyLocal(msg.params);
    setSceneInfo({ width: msg.scene.w, height: msg.scene.h });
  };

  const onParams = (msg) => {
    applyLocal(msg.params);
  };

  const onStatus = (statusMessage) => setStatus(doc, statusMessage);

  return { onInit, onParams, onStatus, layoutLeft, layoutRight };
}
