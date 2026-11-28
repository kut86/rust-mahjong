/* Сервис-воркер: игра открывается из кеша и работает без сети (кроме рейтинга и сохранений), обновления скачиваются в фоне и применяются по кнопке.
   Строка V подставляется скриптом deploy.sh (хеш файлов сайта): новый V = новая версия. API игры сюда не попадает. */
const V = 'd894afc1';
const CORE = 'rm-core-' + V, IMG = 'rm-img';
const FILES = ['index.html', 'tanki.html', 'mahjong.html', 'privacy.html', 'frames.js', 'manifest.json'];
const base = self.registration.scope;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE).then(c => Promise.all(FILES.map(f => fetch(new Request(base + f, { cache: 'reload' })).then(r => { if (r.ok) return c.put(base + f, r) }).catch(() => {})))));
}); // skipWaiting не вызываем: новая версия ждёт, пока игрок нажмёт «Обновить», чтобы не подменить игру посреди боя
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('rm-core-') && k !== CORE).map(k => caches.delete(k)))));
});
self.addEventListener('message', e => {
  if (e.data === 'SKIP') self.skipWaiting();
  else if (e.data === 'VER' && e.ports && e.ports[0]) e.ports[0].postMessage(V);
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || !u.href.startsWith(base)) return; // API и чужие адреса идут напрямую
  const path = u.pathname.slice(new URL(base).pathname.length) || 'index.html';
  if (FILES.includes(path) || r.mode === 'navigate') {
    const key = base + (FILES.includes(path) ? path : 'index.html');
    e.respondWith(caches.open(CORE).then(c => c.match(key)).then(h => h || fetch(r)));
    return;
  }
  if (/^img\//.test(path)) { // картинки: из кеша, если нет — из сети и в кеш (ошибки 404 не кешируем)
    e.respondWith(caches.open(IMG).then(c => c.match(r).then(h => h || fetch(r).then(n => { if (n.ok) c.put(r, n.clone()); return n }))));
  }
});
