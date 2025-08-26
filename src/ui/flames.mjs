const PARTS = 50;

function makeFlame(doc){
  const fire = doc.createElement('div');
  fire.className = 'fire';
  for (let i = 0; i < PARTS; i++){
    const p = doc.createElement('div');
    p.className = 'particle';
    p.style.animationDelay = `${Math.random()}s`;
    p.style.left = `${Math.random() * 100}%`;
    fire.appendChild(p);
  }
  return fire;
}

export function toggleFlames(doc, show, count = 1){
  const host = doc.getElementById('flames');
  if (!host) return;
  host.style.display = show ? 'flex' : 'none';
  if (!show) return;
  host.innerHTML = '';
  for (let i = 0; i < count; i++) host.appendChild(makeFlame(doc));
}
