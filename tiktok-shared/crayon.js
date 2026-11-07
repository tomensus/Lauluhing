// Crayon / marker drawing kit for Lauluhing carousels (first used in kriidijoonistus/).
// Include with <script src="../../tiktok-shared/crayon.js"></script>; it adds the SVG filters
// to the page and exposes shape/fill/line/person/gift/heart/sun/cloud/note/sparkle/ground/etc.
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute">
  <filter id="grain" x="-5%" y="-10%" width="110%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.4" result="m"/>
    <feComposite in="SourceGraphic" in2="m" operator="in" result="t"/>
    <feTurbulence type="turbulence" baseFrequency=".03" numOctaves="2" seed="7" result="w"/>
    <feDisplacementMap in="t" in2="w" scale="4"/>
  </filter>
  <filter id="rough1" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="1" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="7"/>
  </filter>
  <filter id="rough2" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="9" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="6"/>
  </filter>
  <filter id="waxy" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="5" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.5" result="m"/>
    <feComposite in="SourceGraphic" in2="m" operator="in"/>
  </filter>
</svg>`);

  const NS = 'http://www.w3.org/2000/svg';
  let seed = 12345;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const jit = a => (rnd() - .5) * 2 * a;
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  let clipN = 0;

  // Crayon fill: diagonal zigzag scribbles clipped to the shape.
  function fill(svg, d, color, o = {}) {
    const { angle = -35, gap = 7, w = 7, op = .95, passes = 2 } = o;
    const id = 'c' + (clipN++);
    const cp = el('clipPath', { id }, svg); el('path', { d }, cp);
    const probe = el('path', { d }, svg); const bb = probe.getBBox(); probe.remove();
    const g = el('g', { 'clip-path': `url(#${id})`, filter: 'url(#waxy)' }, svg);
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2, R = Math.hypot(bb.width, bb.height) / 2 + 20;
    for (let p = 0; p < passes; p++) {
      const a = angle + (p ? 70 + jit(10) : jit(6));
      let pts = [];
      for (let v = -R; v < R; v += gap) {
        pts.push(`${(-R + jit(10)).toFixed(1)},${(v + jit(3)).toFixed(1)}`);
        pts.push(`${(R + jit(10)).toFixed(1)},${(v + gap / 2 + jit(3)).toFixed(1)}`);
      }
      el('polyline', { points: pts.join(' '), fill: 'none', stroke: color, 'stroke-width': w * (p ? .8 : 1), 'stroke-linejoin': 'round',
        opacity: p ? op * .75 : op, transform: `translate(${cx} ${cy}) rotate(${a})` }, g);
    }
    return g;
  }
  // Wobbly marker outline, drawn twice for a hand-drawn feel.
  function line(svg, d, color = '#1a1a1a', w = 5, o = {}) {
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#rough1)', opacity: o.op ?? .95 }, svg);
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': w * .55, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#rough2)', opacity: .6 }, svg);
  }
  const shape = (svg, d, color, outline = '#1a1a1a', o = {}) => { fill(svg, d, color, o); if (outline) line(svg, d, outline, o.ow ?? 5); };

  const circ = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  const rect = (x, y, w, h) => `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
  const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
  const heartD = (x, y, s) => `M${x} ${y + 30 * s} C${x - 46 * s} ${y - 4 * s} ${x - 30 * s} ${y - 40 * s} ${x} ${y - 18 * s} C${x + 30 * s} ${y - 40 * s} ${x + 46 * s} ${y - 4 * s} ${x} ${y + 30 * s} Z`;

  function heart(svg, x, y, s = 1) { shape(svg, heartD(x, y, s), '#e3151b', '#b80d12', { gap: 7, w: 4.5, ow: 4 }); }
  function sun(svg, x, y, r) {
    shape(svg, circ(x, y, r), '#ffd21a', '#e6b800', { gap: 8 });
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + .2;
      line(svg, `M${x + Math.cos(a) * (r + 20)} ${y + Math.sin(a) * (r + 20)} L${x + Math.cos(a) * (r + 56)} ${y + Math.sin(a) * (r + 56)}`, '#ffcc00', 7); }
  }
  function cloud(svg, x, y, s = 1) {
    const d = `M${x} ${y} c${-40 * s} 0 ${-50 * s} ${-44 * s} ${-14 * s} ${-52 * s} c${6 * s} ${-36 * s} ${62 * s} ${-44 * s} ${78 * s} ${-14 * s} c${26 * s} ${-26 * s} ${80 * s} ${-12 * s} ${70 * s} ${26 * s} c${36 * s} ${4 * s} ${34 * s} ${42 * s} ${0} ${40 * s} Z`;
    shape(svg, d, '#cfe4fb', '#2f7fd6', { gap: 11, w: 4, op: .8, ow: 4.5 });
  }
  function note(svg, x, y, s = 1, c = '#1a1a1a') {
    shape(svg, ell(x, y, 22 * s, 16 * s), c, c, { gap: 5, w: 5, ow: 4 });
    line(svg, `M${x + 20 * s} ${y - 4 * s} V${y - 90 * s} C${x + 40 * s} ${y - 70 * s} ${x + 62 * s} ${y - 66 * s} ${x + 58 * s} ${y - 40 * s}`, c, 6);
  }
  function hair(svg, cx, cy, r, color = '#151515') {
    let d = `M${cx - r} ${cy}`;
    for (let i = 0; i < 70; i++) { const a = Math.PI + rnd() * Math.PI, rr = r * (.55 + rnd() * .6);
      d += ` Q${cx + Math.cos(a) * rr * 1.2 + jit(12)} ${cy + Math.sin(a) * rr * 1.1 + jit(12)} ${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr * 1.05}`; }
    line(svg, d, color, 6);
    fill(svg, `M${cx - r - 4} ${cy + 4} A${r + 4} ${r + 8} 0 0 1 ${cx + r + 4} ${cy + 4} Q${cx} ${cy - r * .3} ${cx - r - 4} ${cy + 4} Z`, color, { gap: 6, w: 6 });
  }
  // person standing at (x, baseline y). opts: shirt, pants, arms: 'down'|'up'|'front', face: true
  function person(svg, x, y, s = 1, o = {}) {
    const { shirt = '#2f6fe0', pants = '#7a4a22', arms = 'down', skin = '#f3c9a2', hairOn = true } = o;
    const P = (dx, dy) => `${x + dx * s} ${y + dy * s}`;
    // legs
    shape(svg, `M${P(-46, -190)} L${P(46, -190)} L${P(44, -24)} L${P(10, -24)} L${P(0, -150)} L${P(-10, -24)} L${P(-44, -24)} Z`, pants, '#1a1a1a', { gap: 8 });
    shape(svg, ell(x - 30 * s, y - 14 * s, 30 * s, 14 * s), '#1a1a1a', '#1a1a1a', { gap: 5 });
    shape(svg, ell(x + 30 * s, y - 14 * s, 30 * s, 14 * s), '#1a1a1a', '#1a1a1a', { gap: 5 });
    // shirt
    shape(svg, `M${P(-62, -310)} L${P(62, -310)} L${P(88, -262)} L${P(60, -246)} L${P(52, -186)} L${P(-52, -186)} L${P(-60, -246)} L${P(-88, -262)} Z`, shirt, '#1a1a1a', { gap: 7 });
    // arms start at the sleeve and end in a hand
    const armPaths = {
      down: [[-76, -256, -98, -166], [76, -256, 98, -166]],
      up: [[-74, -276, -136, -404], [74, -276, 136, -404]],
      front: [[-72, -254, -40, -214], [72, -254, 40, -214]],
      wave: [[-76, -256, -98, -166], [74, -276, 140, -396]],
      shrug: [[-74, -270, -150, -300], [74, -270, 150, -300]],
      reach: [[-76, -256, -98, -166], [74, -262, 150, -170]],
    }[arms];
    for (const [x1, y1, x2, y2] of armPaths) {
      el('path', { d: `M${P(x1, y1)} L${P(x2, y2)}`, stroke: '#1a1a1a', 'stroke-width': 28 * s, 'stroke-linecap': 'round', filter: 'url(#rough1)' }, svg);
      el('path', { d: `M${P(x1, y1)} L${P(x2, y2)}`, stroke: skin, 'stroke-width': 19 * s, 'stroke-linecap': 'round', filter: 'url(#rough1)' }, svg);
      shape(svg, circ(x + x2 * s, y + y2 * s, 15 * s), skin, '#1a1a1a', { gap: 6, op: .8, ow: 4 });
    }
    // long hair falls behind the head to the shoulders
    if (o.longHair) shape(svg, `M${P(-52, -372)} C${P(-60, -440)} ${P(60, -440)} ${P(52, -372)} L${P(62, -290)} Q${P(0, -280)} ${P(-62, -290)} Z`, o.hairColor || '#151515', '#1a1a1a', { gap: 6, ow: 3.5 });
    // head
    shape(svg, circ(x, y - 362 * s, 44 * s), skin, '#1a1a1a', { gap: 10, op: .75, ow: 4.5 });
    if (o.face !== false) {
      shape(svg, circ(x - 15 * s, y - 366 * s, 4 * s), '#1a1a1a', null, { gap: 3, w: 4 });
      shape(svg, circ(x + 15 * s, y - 366 * s, 4 * s), '#1a1a1a', null, { gap: 3, w: 4 });
      line(svg, `M${P(-16, -346)} Q${P(0, -330)} ${P(16, -346)}`, '#1a1a1a', 4.5);
      if (o.closed) { /* closed happy eyes over the dots */ }
    }
    if (hairOn) hair(svg, x, y - 382 * s, 46 * s, o.hairColor);
    if (o.glasses) { line(svg, `${circ(x - 16 * s, y - 366 * s, 12 * s)} ${circ(x + 16 * s, y - 366 * s, 12 * s)} M${P(-4, -366)} L${P(4, -366)}`, '#1a1a1a', 3.5); }
    if (o.mustache) shape(svg, `M${P(-26, -340)} C${P(-14, -352)} ${P(-4, -346)} ${P(0, -342)} C${P(4, -346)} ${P(14, -352)} ${P(26, -340)} C${P(14, -334)} ${P(4, -336)} ${P(0, -338)} C${P(-4, -336)} ${P(-14, -334)} ${P(-26, -340)} Z`, o.mustache, '#1a1a1a', { gap: 4, w: 5, ow: 3.5 });
    return { handL: [x + armPaths[0][2] * s, y + armPaths[0][3] * s], handR: [x + armPaths[1][2] * s, y + armPaths[1][3] * s] };
  }
  function gift(svg, x, y, w, h, o = {}) {
    const { box = '#e3151b', ribbon = '#ffd21a' } = o;
    shape(svg, rect(x, y, w, h), box, '#1a1a1a', { gap: 9 });
    shape(svg, rect(x - w * .06, y - h * .22, w * 1.12, h * .24), box, '#1a1a1a', { gap: 8, angle: 20 });
    shape(svg, rect(x + w * .44, y - h * .22, w * .12, h * 1.22), ribbon, '#1a1a1a', { gap: 6, w: 4.5, ow: 4 });
    const bx = x + w / 2, by = y - h * .22;
    shape(svg, `M${bx} ${by} C${bx - w * .5} ${by - h * .55} ${bx - w * .55} ${by - h * .05} ${bx} ${by} Z`, ribbon, '#1a1a1a', { gap: 6, w: 4.5, ow: 4 });
    shape(svg, `M${bx} ${by} C${bx + w * .5} ${by - h * .55} ${bx + w * .55} ${by - h * .05} ${bx} ${by} Z`, ribbon, '#1a1a1a', { gap: 6, w: 4.5, ow: 4 });
  }
  function sparkle(svg, x, y, s = 1, c = '#ffcc00') {
    line(svg, `M${x} ${y - 22 * s} V${y + 22 * s} M${x - 22 * s} ${y} H${x + 22 * s} M${x - 12 * s} ${y - 12 * s} L${x + 12 * s} ${y + 12 * s} M${x + 12 * s} ${y - 12 * s} L${x - 12 * s} ${y + 12 * s}`, c, 5);
  }
  function ground(svg, y, x1 = 30, x2 = 970) { line(svg, `M${x1} ${y} C${x1 + 200} ${y - 6} ${x2 - 300} ${y + 8} ${x2} ${y - 2}`, '#1a1a1a', 5); }

