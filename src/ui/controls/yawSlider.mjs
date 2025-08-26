export function initYawSlider(el, P, send){
  const MAX_YAW = Math.PI;
  const handle = el.querySelector('.handle');
  const dead = 0.05;

  const setPos = (n) => {
    handle.style.left = `${(n * 0.5 + 0.5) * 100}%`;
  };

  const sendVal = (n) => {
    if (Math.abs(n) < dead) n = 0;
    P.post.yawSpeed = n * MAX_YAW;
    send({ yawSpeed: P.post.yawSpeed });
  };

  let active = false;
  const update = (e) => {
    const rect = el.getBoundingClientRect();
    let n = (e.clientX - rect.left) / rect.width * 2 - 1;
    if (n > 1) n = 1; if (n < -1) n = -1;
    setPos(n);
    sendVal(n);
  };

  el.addEventListener('pointerdown', e => { active = true; el.setPointerCapture(e.pointerId); update(e); });
  el.addEventListener('pointermove', e => { if (active) update(e); });
  el.addEventListener('pointerup',   e => { active = false; el.releasePointerCapture(e.pointerId); });

  setPos(0);

  return (yawSpeed) => {
    setPos((yawSpeed || 0) / MAX_YAW);
  };
}
