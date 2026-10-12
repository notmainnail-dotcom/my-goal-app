// Офлайн-режим: сначала сеть (чтобы обновления приходили), без сети — сохранённая копия.
const C = 'kurs-v4';
const FILES = ['./', './index.html', './cloud.js', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // удаляем только свои старые кэши: на том же домене github.io живёт приложение английского
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kurs-') && k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // только свои файлы: запросы к Supabase (данные, токены) не кэшируем
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(C).then(c => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
