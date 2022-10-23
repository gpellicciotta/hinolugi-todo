// Service-worker for back-ground caching and processing.
// Must be put in root, otherwise it won't work

const APP_VERSION = "v1.41.0"
const CACHE_NAME = `hinolugi-utils@${APP_VERSION}`; // Update to force deleting any old cache and starting a new

const STATIC_ASSETS = [
  // Base assets:
  '/manifest.json',
  '/index.html',
  
  '/js/utils.js',
  '/js/startup.mjs',
  '/js/tooltip.js',
  '/js/reorder.mjs',
  
  '/css/utils.css',

  '/media/todo-icon.svg',
  '/media/todo-icon-512x512.png',
  '/media/todo-icon-96x96.png',

  // Shared assets:
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-icon.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-logo.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/css/reset.css',
  'https://www.pellicciotta.com/hinolugi-support.js/css/colors.css',
  'https://kit.fontawesome.com/1c60ca333d.js',
  'https://fonts.googleapis.com/css?family=Roboto'
];

self.addEventListener('install', function(event) {
  console.info(`todo:service-worker: installing`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      if (!cache) {
        console.warning(`todo:service-worker: failed to open cache ${CACHE_NAME}`);
        return ;
      }
      console.info(`todo:service-worker: adding files to off-line cache ${CACHE_NAME}`);
      return cache.addAll(STATIC_ASSETS);
    }).catch(error => {
      console.error(`todo:service-worker: failed to add all files to cache ${CACHE_NAME}: ${error}`);
    }).finally(() => {
      console.info(`todo:service-worker: installation has finished`);
    })
  );
});

self.addEventListener('activate', function (event) {
  console.log(`todo:service-worker: activating`);
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          // Return true if you want to remove this cache,
          return cacheName !== CACHE_NAME;
        }).map(function (cacheName) {
          console.info(`todo:service-worker: deleting old cache ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }).finally(() => {
      clients.claim();
      console.log(`todo:service-worker: active now`);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.info(`todo:service-worker: trying to fetch response for '${event.request.url}'`);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.info(`todo:service-worker: serving cached response for ${event.request.url}`);
        return response;
      }
      return fetch(event.request).then((response) => {
        // Save a copy of the response and put in cache
        console.info("Cloning response:", response);
        const cachedResponse = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
          console.info(`todo:service-worker: caching response for request '${event.request.url}'`);
          return cache.put(event.request, cachedResponse);
        }).catch((err) => {
          console.warn(`todo:service-worker: failed to cache response for request '${event.request.url}'`, err);
        }));
        console.warn(`todo:service-worker: not serving from cache for request '${event.request.url}'`);
        return response;
      });
    })
  );
});

