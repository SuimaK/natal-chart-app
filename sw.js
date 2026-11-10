/* Service worker версии для экрана «Домой». Собирается tools/build_site.py: вместо {"cities.json": "4a7f3d76c35e", "ephem-1800.v2.txt": "268b50cd235b", "ephem-1900.v2.txt": "d1a458af2476", "ephem-2000.v2.txt": "42e54357db08", "ephem-2100.v2.txt": "6721d0b44885", "ephem-2200.v2.txt": "8d149b68f2c6", "ephem-2300.v2.txt": "0b6e329ddad8", "ephem-meta.json": "e443205bc24a", "f-cormorant-cyr.woff2": "4bdf6f01b9dd", "f-cormorant-lat.woff2": "c27d01380ad1", "f-golos-cyr.woff2": "2f175b8fc40e", "f-golos-lat.woff2": "f8d71091110f", "f-jbmono-lat.woff2": "2c32b9b3ee35", "f-sym1.woff2": "f55113169bfd", "f-sym2.woff2": "84f5e4556515", "icon-180.png": "b6c645994684", "icon-192.png": "0a9d89e10a61", "icon-512.png": "3c6ab22e8af9", "index.html": "d5964ba25f53", "manifest.webmanifest": "604dd25061cf", "texts-combo-chiron.json": "14a90deb5653", "texts-combo-jupiter.json": "f697b65b350f", "texts-combo-mars.json": "b0d6f437fd8c", "texts-combo-mercury.json": "ea9eba90b195", "texts-combo-moon.json": "026ae5b1e052", "texts-combo-neptune.json": "e0e014b69560", "texts-combo-node.json": "d18e52c3ac55", "texts-combo-pluto.json": "a97caab7aba4", "texts-combo-saturn.json": "ec0e28e551ae", "texts-combo-snode.json": "b75437c7f6e8", "texts-combo-sun.json": "4e46dcb0d6fd", "texts-combo-uranus.json": "cc0e73bbd533", "texts-combo-venus.json": "ba321143d97b", "texts-houses.json": "f0b8dccc8ae8", "texts-planets.json": "7724b97868fa", "tz-extra.json": "27f918c3d7d0"} подставляется
   список файлов с контрольными суммами, вместо 60 — номер выпуска.
   Страница: сначала сеть (чтобы новая версия приходила сразу), при отсутствии сети или ответе дольше 3 с — сохранённая копия.
   Остальные файлы: из памяти телефона; файл скачивается заново, только если изменилась его контрольная сумма. */
const VERSION = "60", FILES = {"cities.json": "4a7f3d76c35e", "ephem-1800.v2.txt": "268b50cd235b", "ephem-1900.v2.txt": "d1a458af2476", "ephem-2000.v2.txt": "42e54357db08", "ephem-2100.v2.txt": "6721d0b44885", "ephem-2200.v2.txt": "8d149b68f2c6", "ephem-2300.v2.txt": "0b6e329ddad8", "ephem-meta.json": "e443205bc24a", "f-cormorant-cyr.woff2": "4bdf6f01b9dd", "f-cormorant-lat.woff2": "c27d01380ad1", "f-golos-cyr.woff2": "2f175b8fc40e", "f-golos-lat.woff2": "f8d71091110f", "f-jbmono-lat.woff2": "2c32b9b3ee35", "f-sym1.woff2": "f55113169bfd", "f-sym2.woff2": "84f5e4556515", "icon-180.png": "b6c645994684", "icon-192.png": "0a9d89e10a61", "icon-512.png": "3c6ab22e8af9", "index.html": "d5964ba25f53", "manifest.webmanifest": "604dd25061cf", "texts-combo-chiron.json": "14a90deb5653", "texts-combo-jupiter.json": "f697b65b350f", "texts-combo-mars.json": "b0d6f437fd8c", "texts-combo-mercury.json": "ea9eba90b195", "texts-combo-moon.json": "026ae5b1e052", "texts-combo-neptune.json": "e0e014b69560", "texts-combo-node.json": "d18e52c3ac55", "texts-combo-pluto.json": "a97caab7aba4", "texts-combo-saturn.json": "ec0e28e551ae", "texts-combo-snode.json": "b75437c7f6e8", "texts-combo-sun.json": "4e46dcb0d6fd", "texts-combo-uranus.json": "cc0e73bbd533", "texts-combo-venus.json": "ba321143d97b", "texts-houses.json": "f0b8dccc8ae8", "texts-planets.json": "7724b97868fa", "tz-extra.json": "27f918c3d7d0"}, CORE = ["cities.json", "ephem-meta.json", "f-cormorant-cyr.woff2", "f-cormorant-lat.woff2", "f-golos-cyr.woff2", "f-golos-lat.woff2", "f-jbmono-lat.woff2", "f-sym1.woff2", "f-sym2.woff2", "icon-180.png", "icon-192.png", "icon-512.png", "index.html", "manifest.webmanifest", "texts-combo-chiron.json", "texts-combo-jupiter.json", "texts-combo-mars.json", "texts-combo-mercury.json", "texts-combo-moon.json", "texts-combo-neptune.json", "texts-combo-node.json", "texts-combo-pluto.json", "texts-combo-saturn.json", "texts-combo-snode.json", "texts-combo-sun.json", "texts-combo-uranus.json", "texts-combo-venus.json", "texts-houses.json", "texts-planets.json", "tz-extra.json"];
const CACHE = "natal-files", PAGE = new URL("index.html?h=page", self.registration.scope).href;   // PAGE — последняя полученная из сети страница
const keyOf = name => new Request(new URL(name + "?h=" + FILES[name], self.registration.scope).href);
const nameOf = url => { const u = new URL(url), s = new URL(self.registration.scope); if (u.origin !== s.origin || !u.pathname.startsWith(s.pathname)) return null; const n = u.pathname.slice(s.pathname.length) || "index.html"; return n in FILES ? n : null; };
async function fetchStore(name) {
  const r = await fetch(new URL(name, self.registration.scope).href, { cache: "no-cache" });
  if (r.ok) { const c = await caches.open(CACHE); await c.put(keyOf(name), r.clone()); }
  return r;
}
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(CORE.map(async n => { if (!(await c.match(keyOf(n)))) await fetchStore(n); }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE), keep = new Set([PAGE, ...Object.keys(FILES).map(n => keyOf(n).url)]);
    for (const k of await c.keys()) if (!keep.has(k.url)) await c.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const name = nameOf(e.request.url);
  if (!name) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE), hit = await c.match(keyOf(name));
    if (name !== "index.html") return hit || fetchStore(name);
    // страница: сеть с ограничением по времени, иначе сохранённая копия
    const net = fetch(e.request.url, { cache: "no-cache" }).then(async r => { if (r.ok) await c.put(PAGE, r.clone()); return r; });
    const saved = await c.match(PAGE) || hit;
    if (!saved) return net;
    return Promise.race([net.catch(() => saved), new Promise(ok => setTimeout(() => ok(saved), 3000))]);
  })());
});
