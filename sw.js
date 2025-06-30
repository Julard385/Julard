const CACHE_NAME = 'presidente-vcm-cache-v5'; // Versione aggiornata
const URLS_TO_CACHE = [
  './',
  './index.html', // Corretto da Presidente.html
  './manifest.json',
  './icon/icon-192.png', // Percorso corretto
  './icon/icon-512.png', // Aggiunta per coerenza
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cabin&family=Poppins:wght@400;700&display=swap',
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
        // Rimuoviamo gli URL esterni che potrebbero causare problemi di CORS durante il caching
        const localUrls = URLS_TO_CACHE.filter(url => !url.startsWith('http'));
        return cache.addAll(localUrls);
      })
      .catch(e => console.error("Installazione cache fallita:", e))
  );
});

// Evento di attivazione: pulisce le vecchie cache.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Rimozione vecchia cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Prende il controllo immediato della pagina
    );
});

// Evento fetch: serve prima dalla cache, poi dalla rete (Cache First).
self.addEventListener('fetch', event => {
  // Ignora le richieste che non sono GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se la risorsa è in cache, la restituisce.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Altrimenti la richiede dalla rete.
        return fetch(event.request).then(networkResponse => {
            // Non salviamo nella cache le risorse esterne (CDN) che vengono richieste al momento
            // per evitare problemi di CORS e per mantenere la cache pulita con solo i file dell'app.
            return networkResponse;
        });
      })
  );
});