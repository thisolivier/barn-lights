import { connect, loadLayouts } from "./network.mjs";
import { initUI, applyUI } from "./ui.mjs";
import { startPreview } from "./render.mjs";

let doc = globalThis.document;
let win = doc && doc.defaultView ? doc.defaultView : globalThis;
let socket = null;
let params = null;
let sceneW = 512, sceneH = 128;
let layoutLeft = null, layoutRight = null;
let ctxLeft = null, ctxRight = null;
let renderer = null;

function setStatus(docArg, msg) {
  const el = docArg.getElementById("status");
  if (el) el.textContent = msg;
}

function send(obj) {
  if (socket && socket.readyState === 1) socket.send(JSON.stringify(obj));
}

function maybeStart() {
  if (params && layoutLeft && layoutRight && ctxLeft && ctxRight && !renderer) {
    renderer = startPreview(
      win,
      doc,
      ctxLeft,
      ctxRight,
      () => params,
      sceneW,
      sceneH,
      layoutLeft,
      layoutRight
    );
  }
}

export async function boot(docArg = globalThis.document) {
  doc = docArg;
  win = docArg.defaultView || globalThis;

  try {
    socket = connect(win, {
      onInit: (m) => {
        params = m.params;
        sceneW = m.scene.w;
        sceneH = m.scene.h;
        initUI(doc, params, send, () => renderer && renderer.toggleFreeze());
        maybeStart();
      },
      onParams: (m) => { params = m.params; applyUI(doc, params); },
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

  const canvasLeft = doc.getElementById("left");
  ctxLeft = canvasLeft.getContext("2d");
  const canvasRight = doc.getElementById("right");
  ctxRight = canvasRight.getContext("2d");

  if (!layoutLeft || !layoutRight) setStatus(doc, "Preview unavailable");
  maybeStart();
}

export { params, sceneW, sceneH, layoutLeft, layoutRight };
