// Service Worker — Império das Máquinas
// Sempre que atualizar o app.html, AUMENTE o número da versão abaixo
// (v1 -> v2 -> v3...), senão o celular das pessoas continua mostrando
// a versão antiga em cache.
const CACHE_VERSION = 'imperio-v31';

const ARQUIVOS_PARA_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './video-desmatamento.mp4',
  './video-cascalho.mp4',
  './video-entulho.mp4',
  './foto-cascalho-thumb.jpg',
  './foto-cascalho-hero.jpg',
  './foto-loteamento-thumb.jpg',
  './foto-loteamento-hero.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((nome) => nome !== CACHE_VERSION).map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resposta) => resposta || fetch(event.request))
  );
});
