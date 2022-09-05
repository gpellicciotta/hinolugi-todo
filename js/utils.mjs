window.addEventListener('load', onFullyLoaded);

console.log("From within utils module !!!");

function onFullyLoaded() {
  registerServiceWorker();
  fixVersion();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(res => console.info("service-worker has been registered", res))
      .catch(err => console.error("service-worker failed to register", err));
  }
  else {
    console.warn("current browser doesn't support service workers - the web-app cannot be installed locally");
  }
}

function fixVersion() {
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
      document.querySelectorAll(".app-version").forEach(el => {
        el.innerText = appVersion;
      });
      document.querySelectorAll(".app-name").forEach(el => {
        el.innerText = appName;
      });
      document.querySelectorAll(".app-description").forEach(el => {
        el.innerText = appDescription;
      });
    })
    .catch(err => console.error("cannot load manifest.json:", err));
}
