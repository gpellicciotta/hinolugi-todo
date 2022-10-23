import { EventEmitter } from '/js/utils/events.mjs';
import { getQuerySelector } from '/js/utils/domutils.mjs';
import { Logger } from '/js/utils/log.mjs';
import * as LogService from '/js/utils/log.mjs';
import { Router } from './router.mjs';

const html = (strings, ...values) => String.raw({ raw: strings }, ...values);

const appViewTemplate = html`
    <main id="app">
      <header id="title"><h1>Todo Lists</h1></header>
      <header id="logo">
        <svg alt="App Logo" class="banner-logo">
          <use xlink:href="media/todo-icons.svg#logo"></use>
        </svg>
      </header>
      <nav id="navigation-bar">
        <ol>
          <li>Location #1</li>
          <li>Location #2</li>
          <li>Location #3</li>
        </ol>        
      </nav>
      <nav id="action-bar">
        <ol>
          <li>Action #1</li>
          <li>Action #2</li>
          <li>Action #3</li>
        </ol>
      </nav>
      <section id="active-view">
        Active view
      </section>
      <footer id="status">Ready</footer>
      <footer id="copyright">Copyright &copy; Giovanni Pellicciotta</footer>
      <footer id="version">1.0.0-pre</footer>
    </main>
`;

/**
 *  Type responsible for keeping track of most important application state, actions and views.
 *  Also enabling global event subscriptions/dispatching.
 *  <p>
 *  It ensures the right view gets activated whenever <code>activateView</code> is invoked, while
 *  properly deactivating any current view. This part of the <code>App</code> is often called <i>the router</i>.</p>
 *  <p>
 *  Application state consists of:<ol>
 *    <li>The signed-in user</li>
 *    <li>The active view</li>
 *    <li>The set of known counters</li>
 *  </ol></p>
 *  <p>
 *  An app also is a visual component as it manages the global application UI within which
 *  the specific content views, action bars and menu components get activated/deactivated.</p>
 */
export class App
{
  //#region Initialization & Configuration

  constructor() {    
    this.log = LogService.getLog('app');    
    this.router = new Router();
  }

  //#endregion 
  //#region Controlling Functions

  attach(selector) {
    this.rootElement = document.querySelector(selector);
    if (!this.rootElement) {
      throw new Error(`Invalid app element selector: '${selector}' did not select a DOM element`);
    }
    this.log.info(`App is attached to '${getQuerySelector(this.rootElement)}' via selector '${selector}'`);
    this.registerEventHandlers();
    this.activateView();
  }

  detach() {
    this.unregisterEventHandlers();
    this.log.info(`App is detached from '${getQuerySelector(this.rootElement)}'`);
    this.rootElement.innerHTML = '';
    this.rootElement = null;
  }

  registerEventHandlers() {

  }

  unregisterEventHandlers() {

  }

  activateView() {
    this.rootElement.innerHTML = appViewTemplate;
  } 

  //#endregion
}