// See also: https://www.youtube.com/watch?v=wv7pvH1O5Ho

window.addEventListener("load", domReady, false);

function domReady() {
  let horizontalEl = document.getElementById("horizontal");
  let cntEl = document.getElementById("item-count");
  let listEl = document.getElementById("item-list");
  listEl.innerHTML = '';
  addChangeEvent(cntEl, createList);
  addChangeEvent(horizontalEl, layoutList);
  createList();
  layoutList();
}

function layoutList() {
  let horizontalEl = document.getElementById("horizontal");
  let listEl = document.getElementById("item-list");
  if (horizontalEl.checked) {
    listEl.classList.add("horizontal");
  }
  else {
    listEl.classList.remove("horizontal");
  }
}

function createList() {
  let cntEl = document.getElementById("item-count");
  let cnt = +cntEl.value;

  let listEl = document.getElementById("item-list");
  listEl.innerHTML = '';
  for (let i = 0; i < cnt; i++) {
    console.log("Adding new child");
    listEl.appendChild(createItem(i + 1));
  }

  addListDragEventListeners();
}

function createItem(itemNum) {
  let elem = document.createElement("li");
  elem.setAttribute("id", `item-${itemNum}`);
  //elem.setAttribute("draggable", "true");
  elem.dataset.itemNum = itemNum;
  elem.classList.add("item");
  elem.innerHTML = `<span draggable="true"><i class="fas fa-grip-lines"></i></span><span class="item-text">List item #${itemNum}</span>`;
  return elem;
}

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

function endDrag(cancelled) {
  if (cancelled) { // Cancel: reset to old position
    moveBefore(dragState.item.parentElement, dragState.item, dragState.nextItem);
  }
  dragState.item.classList.remove("dragging");
}

function addListDragEventListeners() {
  let listEl = document.getElementById("item-list");
  // List events:
  listEl.addEventListener("drop", () => { // Record successful drop (to make distinction from 'cancel'):
    console.debug(`Drag-drop on list`);
    dragState.dropped = true;
  });
  listEl.addEventListener("dragover", (ev) => { // Enable as drop-target:
    ev.preventDefault();
  });
  listEl.addEventListener("dragend", () => { // Finish operation: cancel or finalize
    console.debug(`Drag-end on list`);
    endDrag(!dragState.dropped)
  });
  // List item events:
  let listItemEls = listEl.querySelectorAll("li.item");
  listItemEls.forEach((el) => { addItemDragEventListeners(el); });
  listItemEls.forEach((el) => { addItemTouchEventListeners(el); });
}

function addItemDragEventListeners(elem) {
  elem.addEventListener("dragstart", (ev) => {
    ev.dataTransfer.effectAllowed = "move";    
    ev.dataTransfer.setDragImage(elem, -20, -20);
    console.debug(`Drag-start on '${elem.innerText}'`);
    startDrag(elem);
  });
  elem.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    console.debug(`Drag-over on '${elem.innerText}'`);
    moveDragOver(elem);
  });
  return elem;
}

function addItemTouchEventListeners(elem) {
  let draggablePart = elem.querySelector("[draggable]");
  if (!draggablePart) {
    console.error("No draggable part found in " + elem.outerHTML);
    return ;
  }
  draggablePart.addEventListener("touchstart", (ev) => {
    console.debug(`Touch-start on '${elem.innerText}'`);
    startDrag(elem);    
  });
  draggablePart.addEventListener("touchmove", (ev) => {
    ev.preventDefault();
    let elemUnderCursor = document.elementFromPoint(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
    if (!elemUnderCursor) {
      return ;
    }
    if (elemUnderCursor.tagName !== 'li') {
      elemUnderCursor = elemUnderCursor.closest('li.item');
    }    
    if (!elemUnderCursor) {
      return ;
    }
    console.debug(`Touch-move over ${elemUnderCursor.innerText}`);
    moveDragOver(elemUnderCursor);
  });
  draggablePart.addEventListener("touchcancel", (ev) => {
    ev.preventDefault();
    console.debug(`Touch-cancel`);
    endDrag(true);
  });
  draggablePart.addEventListener("touchend", (ev) => {
    ev.preventDefault();
    console.debug(`Touch-end`);
    endDrag(false);
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

function addChangeEvent(elem, changeFunc) {
  elem.addEventListener("change", changeFunc);
  elem.addEventListener("keyup", changeFunc);
  elem.addEventListener("paste", changeFunc);
} 