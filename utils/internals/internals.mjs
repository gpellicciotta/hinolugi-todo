// Constants and builtin data:
const UTILITY_VERSION = '1.1.0'
const EMPTY_STATE = '{}';

// Startup:
document.addEventListener('DOMContentLoaded', onDomReady);

// State:

function loadFromStorage() {

}

function saveToStorage() {

}

function onDomReady() {
  const storageKeysSelectEl = document.getElementById("storage-keys");
  refreshListOfStorageKeys().then(refreshActiveStorageKeyValue);
  storageKeysSelectEl.addEventListener("change", refreshActiveStorageKeyValue);
  const refreshStorageKeysButtonEl = document.getElementById("refresh-storage-keys");
  refreshStorageKeysButtonEl.addEventListener("click", async () => { return refreshListOfStorageKeys().then(refreshActiveStorageKeyValue); });
  const clearStorageKeyButtonEl = document.getElementById("clear-storage-key");
  clearStorageKeyButtonEl.addEventListener("click", async () => { return clearActiveStorageKey().then(refreshListOfStorageKeys).then(refreshActiveStorageKeyValue); });
  const deleteAllStorageKeysButtonEl = document.getElementById("delete-all-storage-keys");
  deleteAllStorageKeysButtonEl.addEventListener("click", async () => { return deleteAllStorageKeys().then(refreshListOfStorageKeys).then(refreshActiveStorageKeyValue); });
  const exportAllStorageKeysButtonEl = document.getElementById("export-all-storage-keys");
  exportAllStorageKeysButtonEl.addEventListener("click", exportAllStorageKeys);
  const importAllStorageKeysButtonEl = document.getElementById("import-all-storage-keys");
  importAllStorageKeysButtonEl.addEventListener("change", async () => { return importAllStorageKeys().then(refreshListOfStorageKeys).then(refreshActiveStorageKeyValue); });

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

async function refreshListOfStorageKeys() {
  console.log(`Refreshing list of storage keys:`);
  const storageKeysSelectEl = document.getElementById("storage-keys");
  const currentStorageKey = storageKeysSelectEl.value;
  storageKeysSelectEl.innerHTML = '';
  let keyNames = [];
  let selected = false;
  for (let i = 0; i < localStorage.length; i++) {
    const localKeyName = localStorage.key(i);
    console.log(`Adding local storage key '${localKeyName}':`);
    storageKeysSelectEl.innerHTML += `<option value="${localKeyName}" ${localKeyName === currentStorageKey ? 'selected' : ''}>${localKeyName}</option>`;
    if (localKeyName === currentStorageKey) {
      selected = true;
    }
    keyNames.push(localKeyName);
  }
  if (!selected && keyNames) { // Select first as default
    storageKeysSelectEl.value = keyNames[0]
  }
  return Promise.resolve(keyNames);
}

function refreshActiveStorageKeyValue() {
  const storageKeysSelectEl = document.getElementById("storage-keys");
  const currentKey = storageKeysSelectEl.value;
  console.log(`Refreshing cache value for '${currentKey}'`);
  const storageValueEl = document.getElementById("storage-value");
  const val = localStorage.getItem(currentKey);
  if (!val) {
    storageValueEl.innerText = '<no value>';
  }
  else {
    let valStr = val;
    try {
      valStr = JSON.stringify(JSON.parse(val), null, 2);
    }
    catch (e) { 
      console.error("Failed to interpret local storage value as JSON: ", e);
      valStr = "\"" + val + "\"";
    }
    storageValueEl.innerText = valStr;
  }
}

async function clearActiveStorageKey() {
  const storageKeysSelectEl = document.getElementById("storage-keys");
  const currentKey = storageKeysSelectEl.value;
  console.log(`Clearing active storage key '${currentKey}':`);
  localStorage.removeItem(currentKey);
}

async function deleteAllStorageKeys() {
  console.log(`Clearing all local storage keys`);
  localStorage.clear();
}

async function exportAllStorageKeys() {
  console.log(`Exporting local storage:`);
  let lsObj = {};
  for (let i = 0; i < localStorage.length; i++) {
    const localKeyName = localStorage.key(i);
    console.log(`Adding local storage key '${localKeyName}':`);
    lsObj[localKeyName] = localStorage.getItem(localKeyName);
  }
  const serializedLs = JSON.stringify(lsObj, null, 2);
  console.log(serializedLs);

  let aEl = document.createElement("a");
  aEl.setAttribute("download", "localStorage.json");
  aEl.setAttribute("href",  URL.createObjectURL(new Blob([JSON.stringify({ "localStorage": lsObj }, null, 2)])));
  aEl.innerText = "Download LocalStorage";
  aEl.style.width = "`1px";
  document.body.appendChild(aEl);
  aEl.click();
  aEl.remove();
}

async function importAllStorageKeys() {
  const importAllStorageKeysButtonEl = document.getElementById("import-all-storage-keys");
  const files = importAllStorageKeysButtonEl.files;
  if (files.length !== 1) {
    console.error(`Not importing local storage from '${files.length}' files`);
    return Promise.reject();
  }
  const importFile = files[0];
  console.log(`Importing local storage from '${importFile.name}':`);
  return new Promise(function(resolve, reject) {
    const fr = new FileReader();
    fr.onload = (e) => {
      const content = e.target.result;
      const obj = JSON.parse(content);
      if (obj.hasOwnProperty("localStorage")) {
        for (let key in obj.localStorage) {
          console.log(`Loading key '${key}' with value '${JSON.stringify(obj.localStorage[key])}'`);
          localStorage.setItem(key, obj.localStorage[key]);
        }
        console.log("Loaded local storage");
        importAllStorageKeysButtonEl.value = ''; 
        resolve("Loaded");
      }
      else {
        const err = `Unknown file contents: ${content.substring(0, 20)}`;
        console.log(err);
        importAllStorageKeysButtonEl.value = '';
        reject(err)
      }
    };
    fr.readAsText(importFile);
  });
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

      const appVersionEls = document.querySelectorAll(".app-version");
      appVersionEls.forEach((el) => { el.innerText = appVersion; })
      const internalsVersionEls = document.querySelectorAll(".internals-version");
      internalsVersionEls.forEach((el) => { el.innerText = UTILITY_VERSION; })
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

  // Shared assets:
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-icon.svg',
  'https://www.pellicciotta.com/hinolugi-support.js/img/hinolugi-logo.svg',
  'https://kit.fontawesome.com/1c60ca333d.js',
  'https://fonts.googleapis.com/css?family=Roboto',
  'https://www.pellicciotta.com/hinolugi-support.js/css/reset.css',
  'https://www.pellicciotta.com/hinolugi-support.js/css/colors.css',

  // Box shadow CSS:
  'http://127.0.0.1:5502/utils/box-shadow/box-shadow.html',
  'http://127.0.0.1:5502/utils/box-shadow/box-shadow.css',
  'http://127.0.0.1:5502/utils/box-shadow/box-shadow.js'
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

