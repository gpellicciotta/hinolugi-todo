// Service-worker for back-ground caching and processing.
// Must be put in root, otherwise it won't work

const APP_VERSION = "v1.32.0"
const CACHE_NAME = `hinolugi-utils@${APP_VERSION}`; // Update to force deleting any old cache and starting a new

const STATIC_ASSETS = [
  // Base assets:
  '/manifest.json',
  '/index.html',
  '/utils.css',
  '/utils.js',
  '/utils.mjs',
  '/tooltip.js',
  '/tooltip.mjs',
  '/reorder.mjs',
  '/hinolugi-utils-icon.svg',
  '/hinolugi-utils-icon-512x512.png',
  '/hinolugi-utils-icon-192x192.png',
  '/hinolugi-utils-icon-512x512.png',

  // Shared assets:
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-icon.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-logo.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/css/reset.css',
  'https://www.pellicciotta.com/hinolugi-support.js/css/colors.css',
  'https://kit.fontawesome.com/1c60ca333d.js',
  'https://fonts.googleapis.com/css?family=Roboto',

  // Unit converter:
  '/unit-converter/unit-converter.html',
  '/unit-converter/unit-converter.css',
  '/unit-converter/unit-converter.mjs',
  '/unit-converter/unit-converter-builtin-conversions.mjs',
  '/unit-converter/unit-converter-icon-96x96.png',
  '/unit-converter/unit-converter-icon-192x192.png',
  '/unit-converter/unit-converter-icon-512x512.png',
  '/unit-converter/unit-converter-icon.svg',

  // Todo list:
  '/todo-list/todo.html',
  '/todo-list/todo.css',
  '/todo-list/todo.js',
  '/todo-list/todo-icon-96x96.png',
  '/todo-list/todo-icon-192x192.png',
  '/todo-list/todo-icon-512x512.png',
  '/todo-list/todo-icon.svg',

  // Morse code:
  '/morse/morse.html',
  '/morse/morse.css',
  '/morse/morse.js',
  '/morse/morse-icon-96x96.png',
  '/morse/morse-icon-192x192.png',
  '/morse/morse-icon-512x512.png',
  '/morse/morse-icon.svg',

  // Reordering:
  '/reordering/reordering.html',
  '/reordering/reordering.css',
  '/reordering/reordering.js',

  // Box shadow CSS:
  '/box-shadow/box-shadow.html',
  '/box-shadow/box-shadow.css',
  '/box-shadow/box-shadow.js',
  
  // Internals:
  '/internals/internals.html',
  '/internals/internals.css',
  '/internals/internals.js'
];

self.addEventListener('install', function(event) {
  console.info(`utils:service-worker: installing`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      if (!cache) {
        console.warning(`utils:service-worker: failed to open cache ${CACHE_NAME}`);
        return ;
      }
      console.info(`utils:service-worker: adding files to off-line cache ${CACHE_NAME}`);
      return cache.addAll(STATIC_ASSETS);
    }).catch(error => {
      console.error(`utils:service-worker: failed to add all files to cache ${CACHE_NAME}: ${error}`);
    }).finally(() => {
      console.info(`utils:service-worker: installation has finished`);
    })
  );
});

self.addEventListener('activate', function (event) {
  console.log(`utils:service-worker: activating`);
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          // Return true if you want to remove this cache,
          return cacheName !== CACHE_NAME;
        }).map(function (cacheName) {
          console.info(`utils:service-worker: deleting old cache ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }).finally(() => {
      clients.claim();
      console.log(`utils:service-worker: active now`);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.info(`utils:service-worker: trying to fetch response for '${event.request.url}'`);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.info(`utils:service-worker: serving cached response for ${event.request.url}`);
        return response;
      }
      return fetch(event.request).then((response) => {
        // Save a copy of the response and put in cache
        console.info("Cloning response:", response);
        const cachedResponse = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
          console.info(`utils:service-worker: caching response for request '${event.request.url}'`);
          return cache.put(event.request, cachedResponse);
        }).catch((err) => {
          console.warn(`utils:service-worker: failed to cache response for request '${event.request.url}'`, err);
        }));
        console.warn(`utils:service-worker: not serving from cache for request '${event.request.url}'`);
        return response;
      });
    })
  );
});

