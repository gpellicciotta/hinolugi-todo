// See also: https://www.youtube.com/watch?v=wv7pvH1O5Ho

window.addEventListener("load", domReady, false);

function addChangeEvent(elem, changeFunc) {
  elem.addEventListener("change", changeFunc);
  elem.addEventListener("keyup", changeFunc);
  elem.addEventListener("paste", changeFunc);
} 

function domReady() {
  let horizontalEl = document.getElementById("horizontal");
  let cntEl = document.getElementById("item-count");
  let listEl = document.getElementById("item-list");
  listEl.innerHTML = '';
  addChangeEvent(cntEl, recreateList);
  addChangeEvent(horizontalEl, relayoutList);
  recreateList();
}

function relayoutList() {
  let horizontalEl = document.getElementById("horizontal");
  let listEl = document.getElementById("item-list");
  if (horizontalEl.checked) {
    listEl.classList.add("horizontal");
  }
  else {
    listEl.classList.remove("horizontal");
  }
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

  listEl.addEventListener("drop", () => { // Record successful drop (to make distinction from 'cancel'):
    console.log(`Drag-drop on list`);
    dropped = true;
  });

  listEl.addEventListener("dragover", (ev) => { // Enable as drop-target:
    ev.preventDefault();
  });

  listEl.addEventListener("dragend", () => { // Finish operation: cancel or finalize
    console.log(`Drag-end on list `);
    if (!dropped) { // Cancel: reset to old position
      moveBefore(draggedItem.parentElement, draggedItem, draggedItemNextSibling);
    }
    draggedItem.classList.remove("dragging");
  });
}

let draggedItem;
let draggedItemNextSibling;
let dropped = false;

function createItem(itemNum) {
  let elem = document.createElement("li");
  elem.setAttribute("id", `item-${itemNum}`);
  //elem.setAttribute("draggable", "true");
  elem.dataset.itemNum = itemNum;
  elem.classList.add("item");
  elem.innerHTML = `<span draggable="true"><i class="fas fa-grip-lines"></i></span><span class="item-text">List item #${itemNum}</span>`;

  elem.addEventListener("dragstart", (ev) => {
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setDragImage(elem, 0, 0);

    draggedItem = elem;
    draggedItemNextSibling = elem.nextElementSibling;
    draggedItem.classList.add("dragging");
    dropped = false;
    console.log(`Drag-start on '${elem.innerText}'`);
  });

  elem.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    if (elem === draggedItem) {
      return ;
    }
    const order = compareOrder(elem, draggedItem);
    if (!order) { return; }
    if (order === -1) { // Move before:
      moveBefore(draggedItem.parentElement, draggedItem, elem);
    }
    else { // Move after:
      moveAfter(draggedItem.parentElement, draggedItem, elem);
    }
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