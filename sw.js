// Service Worker — Império das Máquinas
// Como o jogo inteiro (fotos de sede, vídeos de obra) já vem embutido em base64 dentro do
// index.html, cachear só os arquivos essenciais já dá acesso offline completo — não precisa
// de uma lista longa de assets.
//
// IMPORTANTE (achado num problema real de atualização): {cache:'no-store'} no fetch abaixo é
// obrigatório — sem isso, o próprio navegador pode devolver uma resposta HTTP cacheada (por
// causa do cabeçalho Cache-Control que o GitHub Pages manda) mesmo dentro do service worker,
// mesmo com a estratégia sendo "rede primeiro". "Rede primeiro" só funciona de verdade se a
// busca ignorar o cache HTTP comum, não só o cache do proprio Service Worker.
//
// CACHE_NAME precisa subir a cada atualização publicada (v1, v2, v3...) — é isso que faz o
// service worker antigo perceber que existe uma versão nova e trocar de vez o cache guardado.

const CACHE_NAME = 'imperio-das-maquinas-v4';
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

// Estratégia: tenta a rede primeiro DE VERDADE (ignorando cache HTTP normal, não só o do
// service worker), cai pro cache guardado só se estiver offline. Assim, atualização do jogo
// aparece na próxima visita com internet, sem exigir que ninguém limpe cache manualmente.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
