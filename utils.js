if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(res => console.info("utils:service-worker: registered now", res))
      .catch(err => console.error("utils:service-worker: failed to register", err))
  })
}
else {
  console.warn("Current browser doesn't support service workers - the web-app cannot be installed locally");
}