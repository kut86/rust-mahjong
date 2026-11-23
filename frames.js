/* frames.js — рамки и украшения аватаров (рейтинг, профиль).
 *
 * КАК ДОБАВИТЬ НОВУЮ РАМКУ ИЛИ УКРАШЕНИЕ
 *  1. В worker.js, в каталоге COS, добавьте строку, например:  'fr:t1': 'Рамка чемпиона'  (рамка — 'fr:…', украшение — 'dc:…').
 *  2. Здесь добавьте запись с тем же именем без префикса: FRAMES.t1 (для 'fr:t1') или DECOS.t1 (для 'dc:t1').
 *     Подложка строки рейтинга — 'bg:…' в COS и PLATES.имя здесь (colors — цвета градиента, glow — свечение, speed — секунд на один блик, edge: true — бегущий ободок и молнии по краю).
 *  3. Если нужно выдавать её за босса — добавьте правило в BOSS_AWARDS в worker.js (например, за 1 место).
 *  Внешний вид задают параметры, рисовать ничего не нужно:
 *    n      — название, которое видит игрок
 *    colors — цвета молний и обводки (любое количество)
 *    bolts  — сколько молний
 *    len    — длина молний (доля радиуса аватара)
 *    width  — толщина молнии
 *    speed  — длительность одного цикла в секундах (меньше = быстрее)
 *    glow   — цвет свечения
 *    ring   — толщина сплошной бегущей обводки в пикселях (0 — без обводки)  [только рамки]
 *    arcs   — молнии, бегущие по кругу вокруг рамки                         [только украшения]
 */
(function () {
  var FRAMES = {
    bp: { n: 'Участник боя с боссом', colors: ['#4fc3ff', '#b07cff', '#ff5fd2', '#ffd24a', '#5cff9d'], bolts: 12, len: 0.32, width: 2.4, speed: 3.2, glow: '#8ab4ff', ring: 3 }
  };
  var DECOS = {
    bp: { n: 'Грозовое украшение', colors: ['#fff27a', '#7af0ff', '#ff7ae6', '#9a7aff'], bolts: 5, arcs: 5, len: 0.5, width: 2, speed: 2.4, glow: '#b07cff' }
  };

  var PLATES = {
    bp: { n: 'Грозовая подложка', colors: ['#4fc3ff', '#b07cff', '#ff5fd2', '#ffd24a'], glow: '#b07cff', speed: 4.5, edge: true }
  };

  var NS = 'http://www.w3.org/2000/svg', CSS_DONE = false;
  function css() {
    if (CSS_DONE) return; CSS_DONE = true;
    var s = document.createElement('style');
    s.textContent =
      '.pfx{position:relative;display:inline-block;vertical-align:middle;width:var(--s,28px);height:var(--s,28px);margin-right:8px;flex:none}' +
      '.pfx>.pfx-av{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;margin:0;position:relative;z-index:1;background:#2b3035}' +
      '.pfx>.pfx-ph{display:flex;align-items:center;justify-content:center;font:700 calc(var(--s,28px)*.45) sans-serif;color:#fff;text-transform:uppercase}' +
      '.pfx-ring{position:absolute;inset:calc(var(--rw,3px)*-1 - 1px);border-radius:50%;z-index:0;animation:pfx-spin calc(var(--sp,3s)*1.6) linear infinite;' +
      '-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - var(--rw,3px) - 1px),#000 calc(100% - var(--rw,3px)));mask:radial-gradient(farthest-side,transparent calc(100% - var(--rw,3px) - 1px),#000 calc(100% - var(--rw,3px)));filter:drop-shadow(0 0 3px var(--gl,#8ab4ff))}' +
      '.pfx-l{position:absolute;inset:-30%;width:160%;height:160%;z-index:2;pointer-events:none;overflow:visible;filter:drop-shadow(0 0 2.5px var(--gl,#8ab4ff))}' +
      '.pfx-l.d{z-index:3;animation:pfx-spin calc(var(--sp,3s)*5) linear infinite reverse}.pfx-l.f{animation:pfx-spin calc(var(--sp,3s)*9) linear infinite}' +
      '.pfx-b{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;animation:pfx-shoot var(--sp,3s) linear infinite}' +
      '.pfx-a{fill:none;stroke-linecap:round;stroke-linejoin:round;animation:pfx-flick calc(var(--sp,3s)*.7) steps(1,end) infinite}' +
      '.pfx-pl{background-image:linear-gradient(100deg,transparent 38%,rgba(255,255,255,.16) 50%,transparent 62%),var(--pg);background-size:260% 100%,100% 100%;background-repeat:no-repeat;animation:pfx-sheen var(--sp,4.5s) linear infinite}' +
      '@property --bc{syntax:"<color>";inherits:true;initial-value:#b07cff}' +
      '.pfx-pl td.rk{background-color:var(--p0,transparent)}' +
      '.pfx-pl td.rk,.pfx-pl.pfx-s td:first-child{box-shadow:inset 3px 0 0 var(--pa,#b07cff)}' +
      '.pfx-pl.pfx-e td{--bt:inset 0 0 0 0 transparent;--bb:inset 0 0 0 0 transparent;--br:inset 0 0 0 0 transparent;--bl:inset 0 0 0 0 transparent;--it:none;--ib:none;--il:none;--ir:none;' +
      'box-shadow:var(--bt),var(--bb),var(--br),var(--bl);background-image:var(--it),var(--ib),var(--il),var(--ir);background-repeat:repeat-x,repeat-x,repeat-y,repeat-y;' +
      'background-position:0 0,0 100%,0 0,100% 0;background-size:auto 8px,auto 8px,8px auto,8px auto;animation:pfx-edge var(--sp,4.5s) linear infinite,pfx-run calc(var(--sp,4.5s)*.4) linear infinite}' +
      '.pfx-pl.pfx-t td{--bt:inset 0 2px 0 var(--bc);--it:var(--zh)}.pfx-pl.pfx-b td{--bb:inset 0 -2px 0 var(--bc);--ib:var(--zh)}' +
      '.pfx-pl.pfx-e td.rk{--bb:inset 0 -2px 0 var(--bc);--ib:var(--zh)}' +
      '.pfx-pl.pfx-e td:last-child{--br:inset -2px 0 0 var(--bc);--ir:var(--zv)}' +
      '.pfx-pl.pfx-e td.rk,.pfx-pl.pfx-e.pfx-s td:first-child{--bl:inset 3px 0 0 var(--bc);--il:var(--zv)}' +
      '@keyframes pfx-edge{0%{--bc:var(--c0)}25%{--bc:var(--c1)}50%{--bc:var(--c2)}75%{--bc:var(--c3)}100%{--bc:var(--c0)}}' +
      '@keyframes pfx-run{to{background-position:32px 0,-32px 100%,0 32px,100% -32px}}' +
      '@keyframes pfx-sheen{0%{background-position:160% 0,0 0}100%{background-position:-60% 0,0 0}}' +
      '.pfx-im{position:absolute;z-index:3;pointer-events:none;left:calc((1 - var(--k,1.4))*50%);top:calc((1 - var(--k,1.4))*50%);width:calc(var(--k,1.4)*100%);height:calc(var(--k,1.4)*100%)}' +
      '.pfx-im.d{z-index:4}.pfx-im>img{width:100%;height:100%;object-fit:contain;display:block}' +
      '.pfx-im.sp{animation:pfx-spin var(--is,20s) linear infinite}.pfx-im.pu>img{animation:pfx-pulse 2.2s ease-in-out infinite}' +
      '.pfx-sk{fill:#fff;animation:pfx-flick calc(var(--sp,2.4s)*.8) steps(1,end) infinite}' +
      '@keyframes pfx-pulse{0%,100%{transform:scale(.94);opacity:.85}50%{transform:scale(1.06);opacity:1}}' +
      '@keyframes pfx-sheen4{0%{background-position:160% 0,0 0,0 0,50% 50%}100%{background-position:-60% 0,0 0,0 0,50% 50%}}' +
      '@keyframes pfx-spin{to{transform:rotate(360deg)}}' +
      '@keyframes pfx-shoot{0%{stroke-dashoffset:1;opacity:1}16%{stroke-dashoffset:0;opacity:1}30%{opacity:.9}48%{opacity:0;stroke-dashoffset:0}100%{opacity:0;stroke-dashoffset:0}}' +
      '@keyframes pfx-flick{0%{opacity:1}12%{opacity:.15}24%{opacity:1}38%{opacity:.35}52%{opacity:1}70%{opacity:0}85%{opacity:.8}100%{opacity:1}}' +
      '@media (prefers-reduced-motion:reduce){.pfx *,.pfx-pl{animation:none!important}.pfx-b{opacity:.85;stroke-dashoffset:0}}';
    document.head.appendChild(s);
  }
  // Детерминированный «случайный» ряд: у одной и той же рамки всегда одинаковый узор
  function rng(seed) { var x = seed >>> 0 || 1; return function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mk(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var R0 = 31.25; // радиус аватара в системе svg 100×100 при увеличении 160%

  // Лучи-молнии, расходящиеся от рамки наружу
  function boltsSvg(d, key, cls) {
    var svg = mk('svg', { viewBox: '0 0 100 100', class: 'pfx-l ' + cls }), rnd = rng(hash(key)), n = d.bolts === 0 ? 0 : (d.bolts || 8);
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.35, len = R0 * (d.len || 0.3) * (0.7 + rnd() * 0.6), r = R0 + 1.5, steps = 4, pts = [];
      for (var k = 0; k <= steps; k++) {
        var rr = r + (len * k) / steps, off = k === 0 || k === steps ? 0 : (rnd() - 0.5) * 5, ta = a + off / rr;
        pts.push((50 + Math.cos(ta) * rr).toFixed(1) + ',' + (50 + Math.sin(ta) * rr).toFixed(1));
      }
      var p = mk('polyline', { points: pts.join(' '), pathLength: 1, class: 'pfx-b', stroke: d.colors[i % d.colors.length], 'stroke-width': d.width || 2 });
      p.style.animationDelay = (-rnd() * (d.speed || 3)).toFixed(2) + 's';
      svg.appendChild(p);
    }
    return svg;
  }
  // Молнии, бегущие дугами по кругу вокруг рамки
  function arcsSvg(d, key) {
    var svg = mk('svg', { viewBox: '0 0 100 100', class: 'pfx-l d' }), rnd = rng(hash(key + 'a')), n = d.arcs === 0 ? 0 : (d.arcs || 5);
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * Math.PI * 2 + rnd() * 0.3, span = 0.5 + rnd() * 0.45, r = R0 + 6 + rnd() * 4, steps = 9, pts = [];
      for (var k = 0; k <= steps; k++) {
        var rr = r + (k === 0 || k === steps ? 0 : (rnd() - 0.5) * 5), ta = a0 + (span * k) / steps;
        pts.push((50 + Math.cos(ta) * rr).toFixed(1) + ',' + (50 + Math.sin(ta) * rr).toFixed(1));
      }
      var p = mk('polyline', { points: pts.join(' '), class: 'pfx-a', stroke: d.colors[i % d.colors.length], 'stroke-width': d.width || 2 });
      p.style.animationDelay = (-rnd() * (d.speed || 2)).toFixed(2) + 's';
      svg.appendChild(p);
    }
    return svg;
  }
  // Картинка из репозитория вокруг аватара (вращение и пульсация по параметрам)
  function imgLayer(d, below) {
    var s = document.createElement('span'); s.className = 'pfx-im' + (below ? '' : ' d') + (d.spin > 0 ? ' sp' : '') + (d.pulse ? ' pu' : '');
    s.style.setProperty('--k', d.imgScale || (below ? 1.35 : 1.7)); if (d.spin > 0) s.style.setProperty('--is', d.spin + 's');
    var im = document.createElement('img'); im.src = d.img; im.alt = ''; im.onerror = function () { s.style.display = 'none'; }; s.appendChild(im);
    return s;
  }
  // Мерцающие искры вокруг аватара
  function sparksSvg(d, key) {
    var svg = mk('svg', { viewBox: '0 0 100 100', class: 'pfx-l f' }), rnd = rng(hash(key + 's')), n = d.sparks || 0, c = d.colors || ['#fff'];
    for (var i = 0; i < n; i++) {
      var a = rnd() * Math.PI * 2, rr = R0 + 3 + rnd() * 14, r = 0.7 + rnd() * 1.3;
      var p = mk('circle', { cx: (50 + Math.cos(a) * rr).toFixed(1), cy: (50 + Math.sin(a) * rr).toFixed(1), r: r.toFixed(2), class: 'pfx-sk', fill: c[i % c.length] });
      p.style.animationDelay = (-rnd() * (d.speed || 2.4)).toFixed(2) + 's'; p.style.fill = c[i % c.length];
      svg.appendChild(p);
    }
    return svg;
  }
  function ident(v, pre) { return v && v.indexOf(pre) === 0 ? v.slice(pre.length) : ''; }

  /* PFX.el(src, name, f, size) — аватар с рамкой.
   *   src  — адрес картинки (https://…) или пустая строка (тогда рисуется кружок с первой буквой)
   *   f    — ['fr:bp','dc:bp','bg:bp'] (рамка, украшение, подложка) или пустое значение
   *   size — размер аватара в пикселях */
  function el(src, name, f, size) {
    css();
    var fr = FRAMES[ident(f && f[0], 'fr:')], dc = DECOS[ident(f && f[1], 'dc:')];
    var w = document.createElement('span'); w.className = 'pfx'; w.style.setProperty('--s', (size || 28) + 'px');
    var av;
    if (src && src.indexOf('https://') === 0) { av = document.createElement('img'); av.src = src; av.alt = ''; av.className = 'pfx-av'; }
    else { av = document.createElement('span'); av.className = 'pfx-av pfx-ph'; av.textContent = String(name || '?').trim().charAt(0) || '?'; }
    w.appendChild(av);
    if (fr) {
      var ring = document.createElement('span'); ring.className = 'pfx-ring';
      ring.style.setProperty('--rw', (fr.ring === undefined ? 3 : fr.ring) + 'px'); ring.style.setProperty('--sp', (fr.speed || 3) + 's'); ring.style.setProperty('--gl', fr.glow || '#8ab4ff');
      ring.style.background = 'conic-gradient(' + fr.colors.concat(fr.colors[0]).join(',') + ')';
      if (fr.ring === 0) ring.style.display = 'none';
      w.appendChild(ring);
      if (fr.bolts !== 0) { var s1 = boltsSvg(fr, f[0], 'f'); s1.style.setProperty('--sp', (fr.speed || 3) + 's'); s1.style.setProperty('--gl', fr.glow || '#8ab4ff'); w.appendChild(s1); }
      if (fr.img) w.appendChild(imgLayer(fr, true));
    }
    if (dc) {
      if (dc.img) w.appendChild(imgLayer(dc, false));
      if (dc.sparks) { var s4 = sparksSvg(dc, f[1]); s4.style.setProperty('--sp', (dc.speed || 2.4) + 's'); w.appendChild(s4); }
      var s2 = arcsSvg(dc, f[1]); s2.style.setProperty('--sp', (dc.speed || 2.4) + 's'); s2.style.setProperty('--gl', dc.glow || '#b07cff'); w.appendChild(s2);
      if (dc.bolts) { var s3 = boltsSvg({ colors: dc.colors, bolts: dc.bolts, len: dc.len, width: dc.width, speed: dc.speed }, f[1] + 'b', 'f'); s3.style.setProperty('--sp', (dc.speed || 2.4) + 's'); s3.style.setProperty('--gl', dc.glow || '#b07cff'); w.appendChild(s3); }
    }
    return w;
  }
  /* PFX.row(tr, f, mode) — подложка всей строки игрока в рейтинге (f[2] = 'bg:bp'). */
  // Бегущая молния по краю: плитка-зигзаг с градиентом цветов подложки (горизонтальная и вертикальная)
  function zig(c, vert) {
    var id = 'g', st = c.concat(c[0]).map(function (x, i, a) { return '<stop offset="' + Math.round(i / (a.length - 1) * 100) + '%" stop-color="' + x + '"/>'; }).join('');
    var pts = vert ? '4,0 1,4 6,9 2,14 6,19 1,25 4,32' : '0,4 4,1 9,6 14,2 19,6 25,1 32,4';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (vert ? 8 : 32) + '" height="' + (vert ? 32 : 8) + '"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' + st + '</linearGradient></defs>' +
      '<polyline points="' + pts + '" fill="none" stroke="url(#' + id + ')" stroke-opacity=".3" stroke-width="3.5" stroke-linejoin="round"/><polyline points="' + pts + '" fill="none" stroke="url(#' + id + ')" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  /* PFX.row(tr, f, mode) — подложка строки игрока в рейтинге (f[2] = 'bg:bp').
   *   mode: 1 — строка из одной линии; 't', 'm', 'b' — верхняя, средняя, нижняя строка карточки из нескольких строк. */
  function row(tr, f, mode) {
    var p = PLATES[ident(f && f[2], 'bg:')];
    if (!p || !tr) return;
    css();
    var c = p.colors.length < 2 ? [p.colors[0], p.colors[0]] : p.colors, g = c.map(function (x, i) { return x + (i % 2 ? '24' : '38') + ' ' + Math.round(i / (c.length - 1) * 100) + '%'; });
    tr.classList.add('pfx-pl');
    var single = mode === 1 || mode === true;
    if (single) tr.classList.add('pfx-s');
    tr.style.setProperty('--pg', 'linear-gradient(90deg,' + g.join(',') + ')');
    tr.style.setProperty('--pa', p.glow || c[0]);
    tr.style.setProperty('--p0', 'color-mix(in srgb,' + c[0] + ' 22%,var(--panel,#23272a))');
    tr.style.setProperty('--sp', (p.speed || 4.5) + 's');
    if (p.edge) {
      tr.classList.add('pfx-e');
      if (single || mode === 't') tr.classList.add('pfx-t');
      if (single || mode === 'b') tr.classList.add('pfx-b');
      for (var i = 0; i < 4; i++) tr.style.setProperty('--c' + i, c[i % c.length]);
      if (p.bolts !== false) { tr.style.setProperty('--zh', zig(c, false)); tr.style.setProperty('--zv', zig(c, true)); }
    }
    if (p.sheen === false || p.img) { // свой набор слоёв: [блик] + градиент + [затемнение + картинка]
      var L = [], Z = [], sh = p.sheen !== false;
      if (sh) { L.push('linear-gradient(100deg,transparent 38%,rgba(255,255,255,.16) 50%,transparent 62%)'); Z.push('260% 100%'); }
      L.push('var(--pg)'); Z.push('100% 100%');
      if (p.img) { var dm = p.imgDim === undefined ? 0.55 : p.imgDim; L.push('linear-gradient(rgba(35,39,42,' + dm + '),rgba(35,39,42,' + dm + '))'); Z.push('100% 100%'); L.push('url("' + p.img + '")'); Z.push('cover'); }
      tr.style.backgroundImage = L.join(','); tr.style.backgroundSize = Z.join(','); tr.style.backgroundRepeat = 'no-repeat'; tr.style.backgroundPosition = p.img ? (sh ? '160% 0,0 0,0 0,50% 50%' : '0 0,0 0,50% 50%') : '0 0';
      tr.style.animationName = sh ? (p.img ? 'pfx-sheen4' : 'pfx-sheen') : 'none';
      if (!sh) tr.style.animation = 'none';
    }
  }
  /* PFX.define({'fr:имя': {n:'Название', d:{…параметры…}}, …}) — подключить украшения, созданные в админке (приходят с сервера). */
  function define(map) {
    for (var id in map) {
      var t = id.slice(0, 3), k = id.slice(3), v = map[id], o = {}; for (var p in v.d) o[p] = v.d[p]; o.n = v.n; if (!o.colors || !o.colors.length) o.colors = ['#4fc3ff', '#b07cff', '#ff5fd2', '#ffd24a'];
      if (t === 'fr:') FRAMES[k] = o; else if (t === 'dc:') DECOS[k] = o; else if (t === 'bg:') PLATES[k] = o;
    }
  }
  /* PFX.preview(kind, d, size) — пробный показ ещё не сохранённого украшения: kind 'fr' | 'dc' | 'bg'. Для 'bg' вернёт строку таблицы. */
  function preview(kind, d, size) {
    define({ [kind + ':__pv']: { n: '…', d: d } });
    if (kind === 'bg') { var t = document.createElement('table'), tr = document.createElement('tr'), td = document.createElement('td'); t.style.cssText = 'width:100%;border-collapse:collapse'; td.style.cssText = 'height:56px;padding:0 12px;text-align:left'; td.appendChild(el('', 'A', ['', '', ''], 32)); td.appendChild(document.createTextNode('Ник игрока')); tr.appendChild(td); t.appendChild(tr); row(tr, ['', '', 'bg:__pv'], 1); return t; }
    return el('', 'A', [kind === 'fr' ? 'fr:__pv' : '', kind === 'dc' ? 'dc:__pv' : '', ''], size || 64);
  }
  window.PFX = { FRAMES: FRAMES, DECOS: DECOS, PLATES: PLATES, define: define, preview: preview, el: el, row: row, has: function (f) { return !!(f && (f[0] || f[1])); },
    name: function (id) { var t = id && id.slice(0, 3), k = id && id.slice(3); return t === 'fr:' ? (FRAMES[k] || {}).n || id : t === 'dc:' ? (DECOS[k] || {}).n || id : t === 'bg:' ? (PLATES[k] || {}).n || id : id; } };
})();
