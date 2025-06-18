const CACHE_NAME = 'presidente-vcm-cache-v4'; // Ho aumentato la versione per forzare l'aggiornamento
const URLS_TO_CACHE = [
  '/',
  'Presidente.html',
  'manifest.json',
  'icon-192.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;700&display=swap',
  'https://cdn.quilljs.com/1.3.6/quill.snow.css',
  'https://cdn.quilljs.com/1.3.6/quill.min.js'
];

// Evento di installazione: memorizza i file principali dell'app nella cache.
self.addEventListener('install', event => {
  self.skipWaiting(); // Forza l'attivazione del nuovo service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta e file principali memorizzati');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento di attivazione: pulisce le vecchie cache.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Evento fetch: serve prima dalla cache, poi dalla rete (Cache First).
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se la risorsa è in cache, la restituisce. Altrimenti la richiede dalla rete.
        return response || fetch(event.request);
      })
  );
});