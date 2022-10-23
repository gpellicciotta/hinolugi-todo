// Startup Module

import * as constants from '/js/constants.mjs';
import * as domutils from '/js/utils/domutils.mjs';
import { getQuerySelector } from '/js/utils/domutils.mjs';
import * as LogService from '/js/utils/log.mjs';
import { App } from './app.mjs';


// Setup logging
LogService.configure({ 
  prefix: 'utils.todo-list', 
  minLevel: LogService.TRACE_LEVEL 
});

// Javascript is available if we're executing:
LogService.trace("Removing 'no javascript' sections...");
document.querySelectorAll('.no-javascript').forEach((el) => {
  LogService.trace(`- Removing ${domutils.getQuerySelector(el)}`);
  el.remove();
});

const app = new App();
app.attach("body");
LogService.info('app is running');

