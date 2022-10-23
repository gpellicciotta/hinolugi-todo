import { Logger } from './log.mjs';
import { getQuerySelector } from './domutils.mjs';

/**
 *  Type representing a component that can be attached/de-attached from the DOM.
 *
 *  A component has following properties:
 *    - id: unique ID
 *    - app: the app it belongs to
 *    - domParentEl: when attached, the DOM element it is attached to.
 */
export default class Component
{
  /**
   *  Create the component.
   *
   *  @param id Unique ID for this component.
   *  @param app The app this component belongs to.
   */
  constructor(id, app) {
    this.id = id;
    this.log = new Logger(`${id}`);
    this.app = app;
    this.template = document.createElement("template");
    this.template.innerHTML = `
      <div id="${this.id}">This is a sample component</div>
    `;
    this.domParentEl = null;
  }

  attach(el) {
    this.log.info(`Attaching component '${this.id}' to DOM element '${getQuerySelector(el)}'...`);
    this.domParentEl = el;
    this.domParentEl.innerHTML = ''; // Delete any previous content
    this.domParentEl.appendChild(this.template.content.cloneNode(true));
  }

  detach() {
    this.log.info(`Detaching component '${this.id}' from DOM element '${getQuerySelector(el)}'...`);
    this.domParentEl = null;
  }
}
