import { connect, loadLayouts } from "./network.mjs";
import { initUI, applyUI } from "./ui.mjs";
import { startPreview } from "./render.mjs";

let doc = globalThis.document;
let win = doc && doc.defaultView ? doc.defaultView : globalThis;
let ws = null;
let P = null;
let sceneW = 512, sceneH = 128;
let layoutLeft = null, layoutRight = null;
let ctxL = null, ctxR = null;
let renderer = null;

function setStatus(docArg, msg) {
  const el = docArg.getElementById("status");
  if (el) el.textContent = msg;
}

function send(obj) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
}

function maybeStart() {
  if (P && layoutLeft && layoutRight && ctxL && ctxR && !renderer) {
    renderer = startPreview(win, doc, ctxL, ctxR, () => P, sceneW, sceneH, layoutLeft, layoutRight);
  }
}

export async function boot(docArg = globalThis.document) {
  doc = docArg;
  win = docArg.defaultView || globalThis;

  try {
    ws = connect(win, {
      onInit: (m) => {
        P = m.params;
        sceneW = m.scene.w;
        sceneH = m.scene.h;
        initUI(doc, P, send, () => renderer && renderer.toggleFreeze());
        maybeStart();
      },
      onParams: (m) => { P = m.params; applyUI(doc, P); },
      onError: () => setStatus(doc, "WebSocket connection error"),
      onClose: () => setStatus(doc, "WebSocket connection closed")
    });
  } catch (err) {
    console.error("Failed to create WebSocket", err);
    setStatus(doc, "Failed to connect to server");
  }

  try {
    const layouts = await loadLayouts(win);
    layoutLeft = layouts.left;
    layoutRight = layouts.right;
  } catch (err) {
    console.error("Failed to load layout", err);
    setStatus(doc, "Failed to load layout");
  }

  const canvL = doc.getElementById("left");
  ctxL = canvL.getContext("2d");
  const canvR = doc.getElementById("right");
  ctxR = canvR.getContext("2d");

  if (!layoutLeft || !layoutRight) setStatus(doc, "Preview unavailable");
  maybeStart();
}

export { P, sceneW, sceneH, layoutLeft, layoutRight };
