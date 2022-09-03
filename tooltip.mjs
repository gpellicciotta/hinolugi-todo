// Tooltip module - allows adding tooltips to elements + showing them correctly
//
// Exposed methods:
// - Enable tooltips being shown
// - Disable tooltips being shown 
// - Create tooltips for all elements under a root element
// - Create a tooltip for one specific element
// 

// 
// <li class="todo-item">... <span class="tooltip-icon">i</span></li>
//   li: position absolute
//   .tooltip-icon: position relative: right: 0, top: 0
//  


// Add tooltips to all elements with a title or data-tooltip attribute
// Add tooltip to specific element (possibly adding a data-tooltip)

/* Class representing the visual tool-tip element. */
class TooltipElement {
  constructor() {

  }


}


document.addEventListener('DOMContentLoaded', onDomReady);

function registerInputChange(e, onFun) {
  e.addEventListener('input', onFun);
  e.addEventListener('change', onFun);
}

function onDomReady() {
  console.debug("DOM is ready:");
  // Start observing the target node for configured mutations
  //const observer = new MutationObserver(onDomChanged);
  //observer.observe(document.body, { childList: true, subtree: true });
  // First load also counts as change
  onDomChanged();
}

function onDomChanged() {
  console.debug("DOM has changed:");
  // Change title attributes into data-tooltip:
  let elsWithTitle = document.querySelectorAll("[title]");
  console.debug("Elements with 'title' attribute:");
  for (let el of elsWithTitle) {
    console.debug("  " + el.outerHTML);
    if (!el.hasAttribute('data-tooltip')) {
      el.setAttribute('data-tooltip', el.title);
      el.removeAttribute('title');
    }
  }
  // Make elements with class .tooltip invisible
  let elsWithToolTipClass = document.querySelectorAll(".tooltip");
  console.debug("Elements with tooltip class:");
  for (let el of elsWithToolTipClass) {
    console.debug("  " + el.outerHTML);
    //el.style.display = 'none';
  }
  // Register hover and click listeners for 'data-tooltip' elements:
  let elsWithDataTooltip = document.querySelectorAll("[data-tooltip]");
  console.debug("Elements with 'data-tooltip' attribute:");
  let touchDevice = ('ontouchstart' in document.documentElement);
  if (touchDevice) {
    console.debug("On touch device");
  }
  for (let el of elsWithDataTooltip) {
    console.debug("  " + el.outerHTML);
    el.addEventListener('click', toggleTooltip);
    if (!touchDevice) {
      el.addEventListener('mouseover', showTooltip);
      el.addEventListener('mouseout', hideTooltip);
    }
  }
}

function toggleTooltip(event) {
  let el = event.target || event.srcElement;
  console.debug("Toggling tooltip for " + el.outerHTML);
  let toolTipId = el.dataset.tooltip;
  console.debug("Tooltip ID is #" + toolTipId);
  let toolTip = document.getElementById(toolTipId);
  console.debug("Tooltip element is " + (toolTip ? toolTip.outerHTML : "<none>"));
  if (toolTip) {
    if (toolTip.style.display !== 'inline-block') {
      toolTip.style.display = 'inline-block';
    }
    else {
      toolTip.style.display = 'none';
    }
  }
}

function showTooltip(event) {
  let el = event.target || event.srcElement;
  console.debug("Showing tooltip for " + el.outerHTML);
  let toolTipId = el.dataset.tooltip;
  console.debug("Tooltip ID is #" + toolTipId);
  let toolTip = document.getElementById(toolTipId);
  console.debug("Tooltip element is " + (toolTip ? toolTip.outerHTML : "<none>"));
  if (toolTip && (toolTip.style.display !== 'inline-block')) {
    toolTip.style.display = 'inline-block';
  }
}

function hideTooltip(event) {
  let el = event.target || event.srcElement;
  console.debug("Hiding tooltip for " + el.outerHTML);
  let toolTipId = el.dataset.tooltip;
  console.debug("Tooltip ID is #" + toolTipId);
  let toolTip = document.getElementById(toolTipId);
  console.debug("Tooltip element is " + (toolTip ? toolTip.outerHTML : "<none>")); 
  if (toolTip && (toolTip.style.display !== 'none')) {
    toolTip.style.display = 'none';
  }
}
