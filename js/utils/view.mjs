import Component from './component.mjs';
import * as utils from './utils.mjs';
import { Logger } from './log.mjs';
import { getQuerySelector } from './domutils.mjs';

/**
 *  Type representing an application content view.
 *
 *  A content view has following additional properties:
 *    - title: the human-readable view title
 *    - routeRegex: regex that can be tested to see whether a view should be activated.
 *
 *  A content view has following additional methods:
 *    - activateForRoute: whether this content view should get activated for the provided route
 */
export default class View extends Component
{
  /**
   *  Create the content view.
   *
   *  @param id Unique ID for this component.
   *  @param app The app this component belongs too.
   *  @param title The view title.
   *  @param routeRegex Regex to determine whether a route should select this view.
   *                    Defaults to `^/{id}(/.*)$`
   */
  constructor(id, app, title, routeRegex) {
    super(id, app);
    this.title = title;
    this.routeRegex = routeRegex || new RegExp("^/" + utils.escapeRegex(id) + "(/.*)?$", "i");
    this.template.innerHTML = this.createMainUIHtml();
    this.eventListeners = [];
  }

  registerEventListener(target, eventType, cb) {
    target.addEventListener(eventType, cb);
    this.log.trace(`Registering event listener for event '${eventType}' in view '${this.id}'`);
    this.eventListeners.push({ target: target, eventType: eventType, handler: cb });
  }

  /** Should be overridden */
  registerEventListeners() {

  }

  unregisterEventListeners() {
    for (let el of this.eventListeners) {
      this.log.trace(`Unregister event listener for event '${el.eventType}' from view '${this.id}'`);
      el.target.removeEventListener(el.eventType, el.handler);
    }
    this.eventListeners = [];
  }

  /** Attach to DOM, register event listeners, do any additional startup */
  attach(el, route, state) {
    this.log.info(`Attaching view '${this.id}' with title '${this.title}' to DOM element '${getQuerySelector(el)}'...`);
    this.domParentEl = el;
    this.domParentEl.innerHTML = ''; // Delete any previous content
    this.domParentEl.appendChild(this.template.content.cloneNode(true));
    this.registerEventListeners();
  }

  /** Detach from DOM, unregister any event listeners, do any additional cleanup */
  detach() {
    this.unregisterEventListeners();
    this.log.info(`Detaching view '${this.id}' with title '${this.title}' from DOM element '${getQuerySelector(el)}'...`);    
    this.domParentEl = null;
  }

  /** Should be overridden */
  createMainUIHtml() {
    return `
      <div id="${this.id}">
        <h1>Sample View ${this.title} (with ID '${this.id}')</h1>
      </div>
      `;
  }
}
