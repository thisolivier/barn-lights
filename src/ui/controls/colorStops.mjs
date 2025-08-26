import { rgbToHex, hexToRgb } from './utils.mjs';

export function colorStopsWidget(key, schema, values, send){
  const label = document.createElement('label');
  label.textContent = schema.label || key;
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '4px';
  label.appendChild(container);

  const bar = document.createElement('div');
  bar.style.position = 'relative';
  bar.style.height = '24px';
  bar.style.border = '1px solid #ccc';
  container.appendChild(bar);

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '4px';
  container.appendChild(list);

  const stops = values[key] || [];
  values[key] = stops;

  function emit(){
    send({ [key]: stops });
  }

  function render(){
    bar.innerHTML = '';
    list.innerHTML = '';

    const grad = stops.map(s=>`${rgbToHex(s.color || [1,1,1])} ${(s.pos ?? 0)*100}%`).join(',');
    bar.style.background = `linear-gradient(to right, ${grad})`;

    stops.forEach((stop,i)=>{
      const handle = document.createElement('div');
      handle.style.position = 'absolute';
      handle.style.left = `${(stop.pos ?? 0)*100}%`;
      handle.style.top = '0';
      handle.style.width = '12px';
      handle.style.height = '100%';
      handle.style.transform = 'translateX(-50%)';
      handle.style.background = rgbToHex(stop.color || [1,1,1]);
      handle.style.cursor = 'pointer';

      handle.onmousedown = (e) => {
        e.preventDefault();
        const onMove = (ev) => {
          const rect = bar.getBoundingClientRect();
          let p = (ev.clientX - rect.left) / rect.width;
          p = Math.min(Math.max(p,0),1);
          stop.pos = p;
          emit();
          render();
        };
        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      };

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '4px';

      const pos = document.createElement('input');
      pos.type = 'number'; pos.min = 0; pos.max = 1; pos.step = 0.01;
      pos.value = stop.pos ?? 0;
      pos.oninput = () => { stop.pos = parseFloat(pos.value); emit(); render(); };

      const col = document.createElement('input');
      col.type = 'color';
      col.value = rgbToHex(stop.color || [1,1,1]);
      col.oninput = () => { stop.color = hexToRgb(col.value); emit(); render(); };

      handle.onclick = () => col.click();

      const del = document.createElement('button');
      del.type = 'button'; del.textContent = 'x';
      del.onclick = () => { stops.splice(i,1); emit(); render(); };

      row.append(pos, col, del);
      list.appendChild(row);
      bar.appendChild(handle);
    });

    const add = document.createElement('button');
    add.type = 'button'; add.textContent = 'Add';
    add.onclick = () => { stops.push({ pos: 0.5, color: [1,1,1] }); emit(); render(); };
    list.appendChild(add);
  }

  render();
  return label;
}
