// Service Worker — Império das Máquinas
// Como o jogo inteiro (fotos de sede, vídeos de obra) já vem embutido em base64 dentro do
// index.html, cachear só os arquivos essenciais já dá acesso offline completo — não precisa
// de uma lista longa de assets.

const CACHE_NAME = 'imperio-das-maquinas-v1';
const ARQUIVOS_ESSENCIAIS = [
  './index.html',
  './manifest.json',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estratégia: tenta a rede primeiro (pra sempre pegar a versão mais nova quando online),
// cai pro cache se estiver offline. Assim, atualização do jogo aparece na próxima visita
// com internet, mas nunca trava o jogador sem conexão.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
