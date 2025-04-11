// Versão do cache - atualize este valor para forçar uma nova instalação
const CACHE_VERSION = 'v2';
const CACHE_NAME = `azumy-calculadora-${CACHE_VERSION}`;

// Arquivos para cachear durante a instalação
const ASSETS = [
  '/',
  '/index.html',
  '/calculadora.html',
  '/viga.html',  // Adicione esta linha
  
  '/escada.html',
  '/css/style.css',
  '/js/app.js',
  '/js/viga.js',
  '/js/escada.js',  // Adicione esta linha
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/favicon.ico'
];

// Estratégia: Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retorna o recurso em cache se encontrado
        if (cachedResponse) {
          return cachedResponse;
        }

        // Caso contrário, busca na rede
        return fetch(event.request)
          .then((response) => {
            // Não cacheamos respostas que não são válidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para adicionar ao cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Evento de instalação - cacheia os recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando recursos offline');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches que não são o atual
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Evento para mensagens (atualização do app)
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});