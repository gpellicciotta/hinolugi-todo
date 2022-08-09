// See also: https://www.youtube.com/watch?v=wv7pvH1O5Ho

window.addEventListener("load", domReady, false);

function addChangeEvent(elem, changeFunc) {
  elem.addEventListener("change", changeFunc);
  elem.addEventListener("keyup", changeFunc);
  elem.addEventListener("paste", changeFunc);
} 

function domReady() {
  let cntEl = document.getElementById("item-count");
  let listEl = document.getElementById("item-list");
  listEl.innerHTML = '';
  addChangeEvent(cntEl, recreateList);
  recreateList();
}

function recreateList() {
  let cntEl = document.getElementById("item-count");
  let cnt = +cntEl.value;

  let listEl = document.getElementById("item-list");
  listEl.innerHTML = '';
  for (let i = 0; i < cnt; i++) {
    console.log("Adding new child");
    listEl.appendChild(createItem(i + 1));
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/dragend_event
  listEl.addEventListener("drop", () => {
    console.log(`Drag-drop on list`);
    //draggedTarget.classList.remove("dragging");
    //draggedTarget = null;
    //dragPlaceholder.remove();
    //dragPlaceholder.replaceWith(draggedTarget);
    //draggedTarget = null;
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/dragend_event
  listEl.addEventListener("dragover", (ev) => {
    console.log(`Drag-over on list`);
    ev.preventDefault();
    //draggedTarget.classList.remove("dragging");
    //draggedTarget = null;
    //dragPlaceholder.remove();
    //dragPlaceholder.replaceWith(draggedTarget);
    //draggedTarget = null;
  });

}

/**
 * Information of the element that the user is dragging.
 * @typedef {{
 *   element: (!Element|undefined),
 *   parent: (!Element|undefined)
 * }}
 */
let draggedTarget;

let draggedItem;
let draggedItemIndex;

let dragPlaceholder;

let beforeLastEnterIndex;
let lastEnterIndex;
let lastLeaveIndex;
let lastEnterX;
let lastEnterY;

function createDragItem(itemNum) {
  let elem = document.createElement("li");
  elem.setAttribute("id", `item-${itemNum}`);
  elem.setAttribute("drag-item", "true");
  // Not draggable !
  elem.dataset.itemNum = itemNum;
  elem.classList.add("item");
  elem.classList.add("drag-placeholder");
  elem.innerHTML = `Possible List item #${itemNum}`;
  return elem;
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

function createItem(itemNum) {
  let elem = document.createElement("li");
  elem.setAttribute("id", `item-${itemNum}`);
  elem.setAttribute("draggable", "true");
  elem.dataset.itemNum = itemNum;
  elem.classList.add("item");
  elem.innerHTML = `<i class="fas fa-grip-lines"></i> List item #${itemNum}`;

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/dragstart_event.
  elem.addEventListener("dragstart", (ev) => {

    ev.dataTransfer.effectAllowed = "move";

    // Update the dragged element that the user is currently dragging.
    draggedTarget = elem;
    //dragPlaceholder = elem;
    dragPlaceholder = createDragItem(itemNum);
    elem.classList.add("dragging");
    
    draggedItemIndex = itemNum - 1;
    beforeLastEnterIndex = itemNum - 1;
    lastEnterIndex = itemNum - 1;
    lastLeaveIndex = itemNum - 1;

    console.log(`Drag-start on '${elem.innerText}' (parent is ${elem.parentElement}) - e-idx:${lastEnterIndex} + l-idx:${lastLeaveIndex}`);
  });

  elem.addEventListener("dragenter", (ev) => {
    //console.log(`Drag-enter on '${elem.innerText}' - idx-2:${beforeLastEnterIndex} + idx-1:${lastEnterIndex}`);
    beforeLastEnterIndex = lastEnterIndex;
    lastEnterIndex = itemNum;
    lastEnterX = ev.pageX;
    lastEnterY = ev.pageY;
  });

  elem.addEventListener("dragleave", (ev) => {
    console.log(`Drag-leave on '${elem.innerText}' - item-idx: ${itemNum - 1} - dragged-item-idx: ${draggedItemIndex} - idx-2:${beforeLastEnterIndex} + idx-1:${lastEnterIndex}`);    
    let itemIdx = itemNum - 1;
    //if (itemNum - 1 !== draggedItemIndex) {
      if (ev.pageY > lastEnterY) { // Moving down
        let placeHolderIdx = itemIdx + 1;
        console.log(`Moving down: itemidx: ${itemIdx} ~ placeholderidx: ${placeHolderIdx} ~ draggedidx: ${draggedItemIndex}`);
        if ((itemIdx !== draggedItemIndex) && (itemIdx + 1 !== draggedItemIndex)) {
          moveAfter(draggedTarget.parentElement, dragPlaceholder, elem);
        }
      }
      else if (ev.pageY < lastEnterY) {  // Moving up
        let placeHolderIdx = itemIdx - 1;
        console.log(`Moving up: itemidx: ${itemIdx} ~ placeholderidx: ${placeHolderIdx} ~ draggedidx: ${draggedItemIndex}`);
        if ((itemIdx !== draggedItemIndex) && (itemIdx - 1 !== draggedItemIndex)) {
          draggedTarget.parentElement.insertBefore(dragPlaceholder, elem);
        }
      }
    //}
    lastLeaveIndex = itemNum - 1;
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/dragover_event.
  elem.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    //console.log(`Drag-over on '${elem.innerText}'`);
    return;
    if ((elem === draggedTarget) || (elem === dragPlaceholder)) {
      return ;
    }
    const order = compareOrder(elem, dragPlaceholder);
    // If the `elem` and `draggedTarget.element` are not siblings: do nothing.
    if (!order) { return; }
    // Move `draggedTarget` to just before `elem`.
    if (order === -1) {
      console.log(`Drag-over on '${elem.innerText}': moving before element`);
      //dragPlaceholder.remove();
      draggedTarget.parentElement.insertBefore(dragPlaceholder, elem);
    }
    else {
      if (elem.nextElementSibling) {
        console.log(`Drag-over on '${elem.innerText}': moving after element (before '${elem.nextElementSibling.innerText}')`);
        //dragPlaceholder.remove(); 
        draggedTarget.parentElement.insertBefore(dragPlaceholder, elem.nextElementSibling);
      }
      else {
        console.log(`Drag-over on '${elem.innerText}': moving at end of parent`);
        //dragPlaceholder.remove(); 
        draggedTarget.parentElement.appendChild(dragPlaceholder);
      }
    }
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/dragend_event
  elem.addEventListener("dragend", () => {
    console.log(`Drag-end on '${elem.innerText}'`);
    draggedTarget.classList.remove("dragging");
    draggedTarget = null;
    dragPlaceholder.remove();
    //dragPlaceholder.replaceWith(draggedTarget);
    //draggedTarget = null;
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/dragend_event
  elem.addEventListener("drop", () => {
    console.log(`Drag-drop on '${elem.innerText}'`);
    //draggedTarget.classList.remove("dragging");
    //draggedTarget = null;
    //dragPlaceholder.remove();
    //dragPlaceholder.replaceWith(draggedTarget);
    //draggedTarget = null;
  });

  return elem;
}

function compareOrder(elem1, elem2) {
  if (elem1.parentElement !== elem2.parentElement) {
    return null;
  }
  if (elem1 === elem2) return 0;
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
  if (elem1.compareDocumentPosition(elem2) & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  return 1;
}
