// Service-worker for back-ground caching and processing.
// Must be put in root, otherwise it won't work

const APP_VERSION = "v1.40.0"
const CACHE_NAME = `hinolugi-utils@${APP_VERSION}`; // Update to force deleting any old cache and starting a new

const STATIC_ASSETS = [
  // Base assets:
  '/manifest.json',
  '/index.html',
  '/js/utils.js',
  '/js/utils.mjs',
  '/js/tooltip.js',
  '/js/reorder.mjs',
  '/css/utils.css',
  '/media/hinolugi-utils-icon.svg',
  '/media/hinolugi-utils-icon-512x512.png',
  '/media/hinolugi-utils-icon-192x192.png',
  '/media/hinolugi-utils-icon-512x512.png',

  // Shared assets:
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-icon.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-logo.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/css/reset.css',
  'https://www.pellicciotta.com/hinolugi-support.js/css/colors.css',
  'https://kit.fontawesome.com/1c60ca333d.js',
  'https://fonts.googleapis.com/css?family=Roboto',

  // Unit converter:
  '/utils/unit-converter/unit-converter.html',
  '/utils/unit-converter/unit-converter.css',
  '/utils/unit-converter/unit-converter.mjs',
  '/utils/unit-converter/unit-converter-builtin-conversions.mjs',
  '/utils/unit-converter/unit-converter-icon-96x96.png',
  '/utils/unit-converter/unit-converter-icon-192x192.png',
  '/utils/unit-converter/unit-converter-icon-512x512.png',
  '/utils/unit-converter/unit-converter-icon.svg',

  // Todo list:
  '/utils/todo-list/todo.html',
  '/utils/todo-list/todo.css',
  '/utils/todo-list/todo.js',
  '/utils/todo-list/todo-icon-96x96.png',
  '/utils/todo-list/todo-icon-192x192.png',
  '/utils/todo-list/todo-icon-512x512.png',
  '/utils/todo-list/todo-icon.svg',

  // Morse code:
  '/utils/morse/morse.html',
  '/utils/morse/morse.css',
  '/utils/morse/morse.js',
  '/utils/morse/morse-icon-96x96.png',
  '/utils/morse/morse-icon-192x192.png',
  '/utils/morse/morse-icon-512x512.png',
  '/utils/morse/morse-icon.svg',

  // Reordering:
  '/utils/reordering/reordering.html',
  '/utils/reordering/reordering.css',
  '/utils/reordering/reordering.js',

  // Box shadow CSS:
  '/utils/box-shadow/box-shadow.html',
  '/utils/box-shadow/box-shadow.css',
  '/utils/box-shadow/box-shadow.js',

  // Training tracker:
  '/utils/training-tracker/training-tracker.html',
  '/utils/training-tracker/training-tracker.css',
  '/utils/training-tracker/training-tracker.mjs',  
  '/utils/training-tracker/training-tracker-icon.svg',  
  '/utils/training-tracker/training-tracker-96x96.png',  
  '/utils/training-tracker/training-tracker-512x512.png',  
  '/utils/training-tracker/half-marathon-training-schedule.json',  
  '/utils/training-tracker/first-half-marathon-training.json',  
  
  // Internals:
  '/utils/internals/internals.html',
  '/utils/internals/internals.css',
  '/utils/internals/internals.js'
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

