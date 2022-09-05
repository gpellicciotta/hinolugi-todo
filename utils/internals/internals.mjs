document.addEventListener('DOMContentLoaded', onDomReady);

// Constants and builtin data:

const EMPTY_STATE = '{}';

// State:

function loadFromStorage() {

}

function saveToStorage() {

}

function onDomReady() {
  const cacheSelectEl = document.getElementById("caches");
  refreshListOfCaches().then(refreshActiveCacheElementsList);

  cacheSelectEl.addEventListener("change", refreshActiveCacheElementsList);
  const refreshCacheButtonEl = document.getElementById("refresh-cache");
  refreshCacheButtonEl.addEventListener("click", async () => { return refreshListOfCaches().then(refreshActiveCacheElementsList); });
  const clearCacheButtonEl = document.getElementById("clear-cache");
  clearCacheButtonEl.addEventListener("click", async () => { return clearActiveCacheElements().then(refreshActiveCacheElementsList); });
  const deleteCacheButtonEl = document.getElementById("delete-cache");
  deleteCacheButtonEl.addEventListener("click", async () => { return deleteActiveCache().then(refreshListOfCaches).then(refreshActiveCacheElementsList); });
  const fillCacheButtonEl = document.getElementById("fill-cache");
  fillCacheButtonEl.addEventListener("click", async () => { return fillActiveCache().then(refreshActiveCacheElementsList).then(refreshActiveCacheElementsList); });

  fillApplicationInfo();
}

async function fillApplicationInfo() {
  const appNameEl = document.getElementById("application-name");
  const appVersionEl = document.getElementById("application-version");
  const appDescriptionEl = document.getElementById("application-description");  
  const appInstalledEl = document.getElementById("application-installed");

  fetch('/manifest.json')
    .then(response => response.json())
    .then(manifest => {
      console.info('manifest', manifest);
      const appVersion = manifest.version || 'unknown';
      console.info(`application version: ${appVersion}`);
      const appName = manifest.name || 'HiNoLuGi Utils';
      console.info(`application name: ${appName}`);
      const appDescription = manifest.description || 'A collection of small utilities and tools.';
      console.info(`application description: ${appDescription}`);
      appNameEl.innerText = appName;
      appVersionEl.innerText = appVersion;
      appDescriptionEl.innerText = appDescription;
      const installed = window.matchMedia('(display-mode: standalone)').matches;
      appInstalledEl.innerText = installed ? 'Yes' : 'No';
    })
    .catch(err => console.error("cannot load manifest.json:", err));  
}

const STATIC_ASSETS = [
  // Base assets:
  'http://127.0.0.1:5502/index.html',
  'http://127.0.0.1:5502/css/utils.css',
  'http://127.0.0.1:5502/js/utils.js',
  'http://127.0.0.1:5502/js/tooltip.js',
  'http://127.0.0.1:5502/js/utils.mjs',
  'http://127.0.0.1:5502/js/reorder.mjs',
  'http://127.0.0.1:5502/media/hinolugi-utils-icon.svg',
  'http://127.0.0.1:5502/media/hinolugi-utils-icon-512x512.png',
  'http://127.0.0.1:5502/media/hinolugi-utils-icon-192x192.png',
  'http://127.0.0.1:5502/media/hinolugi-utils-icon-512x512.png',

  // Shared assets:
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-icon.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-logo.svg',
  'https://kit.fontawesome.com/1c60ca333d.js',
  'https://fonts.googleapis.com/css?family=Roboto',
  'https://www.pellicciotta.com/hinolugi-support.js/css/reset.css',
  'https://www.pellicciotta.com/hinolugi-support.js/css/colors.css',

  // Box shadow CSS:
  'http://127.0.0.1:5502/box-shadow/box-shadow.html',
  'http://127.0.0.1:5502/box-shadow/box-shadow.css',
  'http://127.0.0.1:5502/box-shadow/box-shadow.js'
];

async function fillActiveCache() {
  const cacheSelectEl = document.getElementById("caches");
  const currentCacheEl = cacheSelectEl.value;
  console.log(`Filling cache '${currentCacheEl}':`);
  return caches.open(currentCacheEl).then((cache) => {
    if (!cache) {
      console.warning(`Failed to open cache '${currentCacheEl}'`);
      return;
    }
    return Promise.allSettled(STATIC_ASSETS.map((asset) => {
      console.info(`Trying to fetch and cache '${asset}'`);
      return cache.add(asset);
    }));
  })
  .catch(error => {
    console.error(`Failed to open cache '${currentCacheEl}': ${error}`);
  });
}

async function refreshListOfCaches() {
  const cacheSelectEl = document.getElementById("caches");
  const currentCacheEl = cacheSelectEl.value;
  cacheSelectEl.innerHTML = '';
  console.log(`Clearing list of caches:`);
  return caches.keys().then((cacheKeys) => {
    cacheKeys.forEach((cacheKey) => {
      console.log(`Adding cache '${cacheKey}':`);
      cacheSelectEl.innerHTML += `<option value="${cacheKey}" ${cacheKey === currentCacheEl ? 'selected' : ''}>${cacheKey}</option>`;
    });
  });
}

async function deleteActiveCache() {
  const cacheSelectEl = document.getElementById("caches");
  console.log(`Deleting cache '${cacheSelectEl.value}':`);
  return caches.delete(cacheSelectEl.value);
}

async function clearActiveCacheElements() {
  const cacheSelectEl = document.getElementById("caches");
  console.log(`Clearing all cache elements in '${cacheSelectEl.value}':`);
  return caches.open(cacheSelectEl.value).then((cache) => {
    return cache.keys().then((keys) => Promise.all(keys.map((request, index, array) => {
      console.log(`Clearing cache element #${index + 1}: '${request.url}'`);
      return cache.delete(request);
    })));
  });
}

function refreshActiveCacheElementsList() {
  const cacheSelectEl = document.getElementById("caches");
  const cachesEl = document.getElementById("cache-elements");
  cachesEl.innerHTML = '';
  console.log(`Refreshing cache elements in '${cacheSelectEl.value}':`);
  caches.open(cacheSelectEl.value).then((cache) => {
    cache.keys().then((keys) => {
      keys.forEach((request, index, array) => {
        console.log(`Adding cache element #${index + 1}: '${request.url}':`);
        cachesEl.innerHTML += "<li>" + request.url + "</li>";
      });
    });
  });
}

function onSelectedCacheChanged() {
  const cacheSelectEl = document.getElementById("caches");
  const cachesEl = document.getElementById("cache-elements");
  cachesEl.innerHTML = '';
  console.log(`Selecting cache elements in '${cacheSelectEl.value}':`);
  caches.open(cacheSelectEl.value).then((cache) => {
    cache.keys().then((keys) => {
      keys.forEach((request, index, array) => {
        cachesEl.innerHTML += "<li>" + request.url + "</li>";
      });
    }); 
  });
}

