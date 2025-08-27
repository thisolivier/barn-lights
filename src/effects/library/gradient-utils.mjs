const mix = (a, b, t) => a + (b - a) * t;
const mix3 = (A, B, t) => [
  mix(A[0], B[0], t),
  mix(A[1], B[1], t),
  mix(A[2], B[2], t)
];

export function sampleGradient(stops, u) {
  const sorted = stops.slice().sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
  let i = 1;
  while (i < sorted.length && u >= sorted[i].pos) i++;
  const left = sorted[i - 1];
  const right = sorted[i] || { pos: sorted[0].pos + 1, color: sorted[0].color };
  const span = right.pos - left.pos;
  const t = span > 0 ? (u - left.pos) / span : 0;
  return mix3(left.color, right.color, t);
}
