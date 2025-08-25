export function connect(win, handlers = {}) {
  const ws = new win.WebSocket(`ws://${win.location.host}`);
  if (handlers.onError) ws.onerror = handlers.onError;
  if (handlers.onClose) ws.onclose = handlers.onClose;
  if (handlers.onInit || handlers.onParams) {
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === "init" && handlers.onInit) handlers.onInit(msg);
      if (msg.type === "params" && handlers.onParams) handlers.onParams(msg);
    };
  }
  return ws;
}

export async function loadLayouts(win) {
  const [leftRes, rightRes] = await Promise.all([
    win.fetch("/layout/left"),
    win.fetch("/layout/right")
  ]);
  return {
    left: await leftRes.json(),
    right: await rightRes.json()
  };
}
