// Utility for re-ordering the items in a container by dragging them around
//
// Requires a container with child elements that have a (descendent that has a) 'draggable'
// attribute.
// While dragging, the child element will get a CSS class of 'dragging'.
//

let dragState = {
  item: null,
  nextItem: null,
  dropped: false
}

function startDrag(elem) {
  dragState = {
    item: elem,
    nextItem: elem.nextElementSibling,
    dropped: false
  };
  dragState.item.classList.add("dragging");
}

function moveDragOver(overElem) {
  if (overElem === dragState.item) {
    return;
  }
  const order = compareOrder(overElem, dragState.item);
  if (!order) { return; }
  if (order === -1) { // Move before:
    moveBefore(dragState.item.parentElement, dragState.item, overElem);
  }
  else { // Move after:
    moveAfter(dragState.item.parentElement, dragState.item, overElem);
  }
}

function endDrag(cancelled, dropCallBack) {
  if (cancelled) { // Cancel: reset to old position
    moveBefore(dragState.item.parentElement, dragState.item, dragState.nextItem);
  }
  dragState.item.classList.remove("dragging");
  if (dropCallBack) {
    dropCallBack(dragState.item);
  } 
  dragState = {
    item: null,
    nextItem: null,
    dropped: false
  };
}

const registeredListeners = new Map();
let listenerId = 1;

function addRevertibleEventListener(targetElement, eventName, eventCallback) {
  const dataName = `data-reorder-${eventName}-listener`;
  const listenerName = `listener-${listenerId++}`;
  const listener = {
    name: listenerName,
    targetElement: targetElement,
    eventName: eventName,
    eventCallback, eventCallback
  };
  removeRevertibleEventListener(targetElement, eventName);
  registeredListeners.set(listenerName, listener);
  targetElement.setAttribute(dataName, listenerName);
  targetElement.addEventListener(listener.eventName, listener.eventCallback);
  //console.debug(`Event listener '${listenerName}' for event type '${listener.eventName}' has been added for:`, listener.targetElement);
}

function removeRevertibleEventListener(targetElement, eventName) {
  const dataName = `data-reorder-${eventName}-listener`;
  const listenerName = targetElement.getAttribute(dataName);
  if (!listenerName) {
    return ;
  }
  const listener = registeredListeners.get(listenerName);
  if (listener) {
    listener.targetElement.removeEventListener(listener.eventName, listener.eventCallback);
    //console.debug(`Event listener '${listenerName}' for event type '${listener.eventName}' has been removed for:`, listener.targetElement);
  }
  else {
    console.warn(`Event listener '${listenerName}' is unknown`);
  }
}

/**
 * Make a container's child elements re-ordeable by enabling dragging them into a new position.
 * 
 * @param containerEl The container that is expected to have child elements to be re-ordered by dragging.
 * @param dropCallBack Function to be invoked when an element is dropped. The argument will be the element being dropped.
 */
export function makeReordable(containerEl, dropCallBack) {
  // Container events:
  addRevertibleEventListener(containerEl, "drop", () => { // Record successful drop (to make distinction from 'cancel'):
    //console.debug(`Drag-drop on list: `, containerEl);
    dragState.dropped = true;
  });
  addRevertibleEventListener(containerEl, "dragover", (ev) => { // Enable as drop-target:
    ev.preventDefault();
  });
  addRevertibleEventListener(containerEl, "dragend", () => { // Finish operation: cancel or finalize
    //console.debug(`Drag-end on list: `, containerEl);
    endDrag(!dragState.dropped, dropCallBack)
  });
  // Child item events:
  let childEls = containerEl.children;
  for (let i = 0; i < childEls.length; i++) {
    let el = childEls.item(i);
    addItemDragEventListeners(el);
    addItemTouchEventListeners(el, dropCallBack); 
  }
}

function addItemDragEventListeners(elem) {
  addRevertibleEventListener(elem, "dragstart", (ev) => {
    ev.dataTransfer.effectAllowed = "move";    
    ev.dataTransfer.setDragImage(elem, -20, -20);
    //console.debug(`Drag-start on: `, elem);
    startDrag(elem);
  });
  addRevertibleEventListener(elem, "dragover", (ev) => {
    ev.preventDefault();
    //console.debug(`Drag-over on: `, elem);
    moveDragOver(elem);
  });
  return elem;
}

function checkCurrentlyDraggable(elem) {
  if (elem.hasAttribute("draggable")) {
    //console.debug("display: ", window.getComputedStyle(elem).display);
    //console.debug("visibility: ", window.getComputedStyle(elem).visibility);
    return (window.getComputedStyle(elem).display !== 'none') &&
           (window.getComputedStyle(elem).visibility !== 'hidden');
  }
  // If we get here: look for descendent element
  let draggablePart = elem.querySelector("[draggable]");
  if (!draggablePart) {
    return false;
  }
  //console.debug("draggable part:", draggablePart);
  //console.debug("draggablePart display: ", window.getComputedStyle(draggablePart).display);
  //console.debug("draggablePart visibility: ", window.getComputedStyle(draggablePart).visibility);
  return (window.getComputedStyle(draggablePart).display !== 'none') && (window.getComputedStyle(draggablePart).visibility !== 'hidden');
}

function addItemTouchEventListeners(elem, dropCallBack) {
  let draggablePart = elem;
  if (!draggablePart) {
    console.error("No draggable part found in " + elem.outerHTML);
    return ;
  }
  addRevertibleEventListener(draggablePart, "touchstart", (ev) => {
    if (!checkCurrentlyDraggable(draggablePart)) {
      //console.debug("Ignoring touch start on currently non-draggable ", draggablePart.outerHTML);
      return ;
    }
    //console.debug('Touch-start on: ', elem);
    startDrag(elem);    
  });
  addRevertibleEventListener(draggablePart, "touchmove", (ev) => {
    if (!draggablePart.classList.contains("dragging")) {
      return ;
    }
    ev.preventDefault();
    let elemUnderCursor = document.elementFromPoint(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
    if (!elemUnderCursor) {
      return ;
    }
    while (elemUnderCursor.parentElement && (elemUnderCursor.parentElement !== elem.parentElement)) {
      elemUnderCursor = elemUnderCursor.parentElement;
      if (elemUnderCursor === document.body) {
        return ;
      }
    }
    if (!elemUnderCursor) {
      return;
    }
    //console.debug('Touch-move on ', elemUnderCursor);
    moveDragOver(elemUnderCursor);
  });
  addRevertibleEventListener(draggablePart, "touchcancel", (ev) => {
    if (!draggablePart.classList.contains("dragging")) {
      return;
    }
    ev.preventDefault();
    //console.debug(`Touch-cancel`);
    endDrag(true, dropCallBack);
  });
  addRevertibleEventListener(draggablePart, "touchend", (ev) => {
    if (!draggablePart.classList.contains("dragging")) {
      return ;
    }
    //ev.preventDefault(); Not preventing since then no 'click' event will get generated
    //console.debug(`Touch-end`);
    endDrag(false, dropCallBack);
  });
}

// Utility methods:

function compareOrder(elem1, elem2) {
  if (elem1.parentElement !== elem2.parentElement) {
    return null;
  }
  if (elem1 === elem2) return 0;
  if (elem1.compareDocumentPosition(elem2) & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  return 1;
}

function moveBefore(parent, elToMove, elToMoveBefore) {
  if (elToMoveBefore) {
    parent.insertBefore(elToMove, elToMoveBefore);
  }
  else {
    parent.appendChild(elToMove);
  }
}

function moveAfter(parent, elToMove, elToMoveAfter) {
  let nextEl = elToMoveAfter.nextElementSibling;
  if (nextEl) {
    parent.insertBefore(elToMove, nextEl);
  }
  else {
    parent.appendChild(elToMove);
  }
}
