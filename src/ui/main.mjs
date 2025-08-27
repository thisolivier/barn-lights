import { initUI, applyUI } from "./controls-logic.mjs";
import { frame } from "./renderer.mjs";

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

export async function run(docArg = globalThis.document){
  const doc = docArg;
  const win = docArg.defaultView || globalThis;

  const [layoutLeft, layoutRight] = await Promise.all([
    loadLightLayout(win, doc, "left"),
    loadLightLayout(win, doc, "right")
  ]);

  const canvL = doc.getElementById("left");
  const ctxL = canvL.getContext("2d");
  const canvR = doc.getElementById("right");
  const ctxR = canvR.getContext("2d");

  const params = {};

  // Describe how incoming WebSocket messages are used.
  const onInit = (message, sendFunction) => {
    // Store default parameters and allocate buffers for both walls.
    Object.assign(params, message.params);
    const sceneWidth = message.scene.w;
    const sceneHeight = message.scene.h;
    const leftFrame  = new Float32Array(sceneWidth * sceneHeight * 3);
    const rightFrame = new Float32Array(sceneWidth * sceneHeight * 3);
    // Build the UI and start rendering frames if canvases are available.
    initUI(win, doc, params, sendFunction);
    if (ctxL && ctxR){
        frame(win, ctxL, ctxR, leftFrame, rightFrame, params, layoutLeft, layoutRight, sceneWidth, sceneHeight);
    } else setStatus(doc, "Preview unavailable");
  };
  const onParams = (message) => {
    Object.assign(params, message.params);
    applyUI(doc, params);
  };
  const onStatus = (statusMessage) => setStatus(doc, statusMessage);

  return { onInit, onParams, onError: onStatus };
}
