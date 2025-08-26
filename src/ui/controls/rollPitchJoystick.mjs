export function initRollPitchJoystick(el, P, send){
  const MAX_PITCH = 128, MAX_ROLL = 128;
  const handle = el.querySelector('.handle');
  const radius = el.clientWidth / 2;
  const dead = Math.sqrt(0.05);

  const setPos = (nx, ny) => {
    handle.style.left = `${50 + nx * 50}%`;
    handle.style.top = `${50 + ny * 50}%`;
  };

  const sendVals = (nx, ny) => {
    const dist = Math.hypot(nx, ny);
    if (dist < dead){ nx = 0; ny = 0; }
    P.post.pitchSpeed = nx * MAX_PITCH;
    P.post.rollSpeed = -ny * MAX_ROLL;
    send({ pitchSpeed: P.post.pitchSpeed, rollSpeed: P.post.rollSpeed });
  };

  let active = false;
  const update = (e) => {
    const rect = el.getBoundingClientRect();
    let nx = (e.clientX - rect.left - radius) / radius;
    let ny = (e.clientY - rect.top - radius) / radius;
    const mag = Math.hypot(nx, ny);
    if (mag > 1){ nx /= mag; ny /= mag; }
    setPos(nx, ny);
    sendVals(nx, ny);
  };

  el.addEventListener('pointerdown', e => { active = true; el.setPointerCapture(e.pointerId); update(e); });
  el.addEventListener('pointermove', e => { if (active) update(e); });
  el.addEventListener('pointerup',   e => { active = false; el.releasePointerCapture(e.pointerId); });

  setPos(0, 0);

  return (pitchSpeed, rollSpeed) => {
    setPos((pitchSpeed || 0) / MAX_PITCH, -(rollSpeed || 0) / MAX_ROLL);
  };
}
