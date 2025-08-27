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
  let sendFunction = () => {};
  const setSend = (fn) => { sendFunction = fn; };

  const onInit = (msg) => {
    Object.assign(params, msg.params);
    const sceneWidth = msg.scene.w;
    const sceneHeight = msg.scene.h;
    const leftFrame  = new Float32Array(sceneWidth * sceneHeight * 3);
    const rightFrame = new Float32Array(sceneWidth * sceneHeight * 3);
    initUI(win, doc, params, (obj) => sendFunction(obj));
    if (ctxL && ctxR){
        frame(win, ctxL, ctxR, leftFrame, rightFrame, params, layoutLeft, layoutRight, sceneWidth, sceneHeight);
    } else setStatus(doc, "Preview unavailable");
  };

  const onParams = (msg) => {
    Object.assign(params, msg.params);
    applyUI(doc, params);
  };

  const onStatus = (statusMessage) => setStatus(doc, statusMessage);

  return { onInit, onParams, onStatus, setSend };
}
