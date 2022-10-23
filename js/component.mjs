let nextComponentId = 1;

/**
 *  A GUI component that can be attached/de-attached from the DOM.
 */
export class Component 
{
  /**
   * Create a component based on following properties:
   *   - id
   *   - name
   *   - description
   *   - model  
   */
  constructor(actionProps) {
    // Constructed props:
    this.id = actionProps.id || ('component-' + (nextComponentId++));
    this.name = actionProps.name;
    this.description = actionProps.description;
    this.model = actionProps.model;
    // State props:
    this.log = new Logger(`${id}`);
    this.template = document.createElement("template");
    this.template.innerHTML = `<div id="${this.id}">${this.name}</div>`;
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