import { EventEmitter } from '/js/utils/events.mjs';
import { getQuerySelector } from '/js/utils/domutils.mjs';
import { Logger } from '/js/utils/log.mjs';
import * as log from '/js/utils/log.mjs';

/**
 *  Type responsible for responding to URL changes.
 */
export class Router
{
  constructor() {
    this.log = new Logger('router');
    this.activeRoute = null;
    this.routes = [];

    let owlc = this.onWindowLocationChanged.bind(this);
    //window.addEventListener("hashchange", owlc);
    console.log("registering popstate listner");
    window.addEventListener("popstate", owlc);
  }

  addRoute(newRoute) {
    this.routes.push(newRoute);
    this.log.info(`Added route ${newRoute}`);
  }

  /**
   * Find a route matching the specified URL.
   *
   * @param url The URL to match routes against.
   * @param fallback The fallback route if no match could be found.
   * @return The found route, or fallback if provided.
   */
  findRouteForURL(url, fallback = null) {
    for (let candidate of this.routes) {
      const m = candidate.routeRegex.test(url);
      if (m) {
        this.log.trace(`URL '${url}' ${m ? "matches" : "doesn't match"} for route ${candidate.id}`);
        return candidate;
      }
    }
    return fallback;
  }

  /**
   * Find a route with the provided ID.
   *
   * @param id The route ID to find.
   * @param fallback The fallback route if no match could be found.
   * @return The found route, or fallback if provided.
   */
  findRouteById(id, fallback = null) {
    for (let candidate of this.routes) {
      if (candidate.id === id) {
        return candidate;
      }
    }
    return fallback;
  }

  onWindowLocationChanged(event) {
    this.log.info("window location changed:", event);
    let route = this.findRouteForURL(window.location.href);
    if (route) {
      event.stopPropagation();
      route.activateCallback();
    }
  }
}