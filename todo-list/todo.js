document.addEventListener('DOMContentLoaded', onDomReady);

const EMPTY_STATE = '{ "max-item-id": 99, "items": [] }';

let maxItemId = 99;
let items = [];
let itemsById = new Map();

function loadFromStorage() {
  // Load state:
  let stateJSON = localStorage.getItem('todo') || EMPTY_STATE;
  console.info("Loaded from storage: " + stateJSON);
  let state = JSON.parse(stateJSON);  
  maxItemId = state["max-item-id"] || 100;
  // Fill state:
  items = state["items"] || [];
  itemsById.clear();
  items.forEach((item) => { itemsById.set(item.id, item); });
}

function saveToStorage() {
  let state = {
    "max-item-id": maxItemId,
    "items": items
  };  
  let stateJSON = JSON.stringify(state, ' ');
  try {
    localStorage.setItem('todo', stateJSON);
    console.info("Saving to storage succeeded");
  }
  catch (error) {
    // TODO: show notification
    console.error('Failed to store state: ', error);
  }
}

function onDomReady() {
  // Get new-item input + register 'enter' action
  let newItemInput = document.getElementById("new-item");
  newItemInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      addNewItem(event);
    }
  });
  // Get add-item button + register 'click' action
  let addItemButton = document.getElementById("add-new-item");
  addItemButton.addEventListener('click', addNewItem);

  // Get todo-list + register 'click' action
  let todoList = document.getElementById("todo-list");
  todoList.addEventListener('click', onListClick);

  // Add items from storage
  loadFromStorage();

  // Re-build from storage
  createItemList();

  // Ensure input has focus
  newItemInput.focus();
}

function onListClick(event) {
  let targetElement = event.target;
  let actionElement = targetElement.closest("[data-action]");
  let liElement = targetElement.closest("li.item");
  console.debug("Click on target: " + targetElement.outerHTML + " within list element " + liElement.outerHTML);
  if (actionElement && (actionElement.dataset.action === 'delete')) {
    event.stopPropagation();
    deleteItem(+liElement.dataset.itemId);
  }
  else if (actionElement && (actionElement.dataset.action === 'toggle')) {
    event.stopPropagation();
    markItem(+liElement.dataset.itemId);
  }
}

function createItemList() {
  let todoList = document.getElementById("todo-list");
  todoList.innerHTML = ''; // Empty
  items.forEach(addItemToList);
}

const ISO_REGEX = /^(\d\d\d\d[-]\d\d[-]\d\d)[T](\d\d[:]\d\d[:]\d\d).*$/;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;

function dateTagFromIsoString(isoString) {
  let now = new Date();
  let d = new Date(isoString);
  let secondsDiff = Math.floor((now.getTime() - d.getTime()) / 1000);
  let nowISO = now.toISOString();
  let m1 = ISO_REGEX.exec(nowISO); 
  let m2 = ISO_REGEX.exec(isoString);
  if (m1[1] === m2[1]) { // Same day: only show time
    return m1[2];
  }
  return m2[1];
}

function addItemToList(item) {
  let todoList = document.getElementById("todo-list");

  let newLiItem = document.createElement("li");
  newLiItem.setAttribute("id", "item-" + item.id);
  newLiItem.dataset.itemId = item.id;
  newLiItem.classList.add("item");
  if (item.status === 'done') {
    newLiItem.classList.add("done");
  }
  newLiItem.innerHTML = `
    <label data-action="toggle" data-item-id="${item.id}"><i class="fa-solid fa-check"></i></label>
    <div class="item-content">
      <span data-action="edit" data-item-id="${item.id}" class="note">${item["note"]}</span>
      <div class="tags">
        <span class="status tag" data-action="toggle" data-item-id="${item.id}">${item["status"]}</span>
        <span class="created tag">${dateTagFromIsoString(item["created-timestamp"])}</span>
        <span class="last-modified tag">${dateTagFromIsoString(item["last-modified-timestamp"])}</span>
      </div>
    </div>
    <button class="icon-button" data-action="delete" data-item-id="${item.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
  `;
  todoList.appendChild(newLiItem);
}

function addNewItem(event) {
  let newItemInput = document.getElementById("new-item");
  let itemText = newItemInput.value;
  let itemId = (++maxItemId);
  let creationDate = new Date();
  let newItem = {
    "id": itemId,
    "status": "todo",
    "note": itemText,
    "created-timestamp": creationDate.toISOString(),
    "last-modified-timestamp": creationDate.toISOString(),
  };
  items.push(newItem);
  itemsById.set(newItem.id, newItem);
  saveToStorage();

  addItemToList(newItem, items.length - 1);  
  newItemInput.value = '';
  newItemInput.focus();
}

function indexOfItem(id) {  
  for (let i = 0; i < items.length; i++) {  
    if (items[i].id === id) {
      return i;
    }
  }
  return -1;
}

function markItem(id) {
  console.info(`Trying to mark item with id ${id}`);
  let item = itemsById.get(id)
  if (!item) {
    console.error(`Cannot mark item with invalid id ${id}`);
    return ;
  }
  // Update model:
  if (item.status === 'done') {
    item.status = 'todo';
  }
  else {
    item.status = 'done';
  }
  item["last-modified-timestamp"] = new Date().toISOString();
  saveToStorage();
  // Update UI:
  let itemEl = document.getElementById("item-" + id);
  if (!itemEl) {
    console.error(`Cannot find item element with id ${id}`);
    return;
  }
  if (item.status === 'done') {
    itemEl.classList.add("done");
  }
  else {
    itemEl.classList.remove("done");
  }
  let lastModifiedEl = itemEl.querySelector(".tag.last-modified");
  if (!lastModifiedEl) {
    console.error(`Cannot find last-modified child tag element for item with id ${id}`);
    return;
  }
  lastModifiedEl.innerText = dateTagFromIsoString(item["last-modified-timestamp"]);
}

function deleteItem(id) {
  console.info(`Trying to delete item with id ${id}`);
  let idx = indexOfItem(id);
  if (idx < 0) {
    console.error(`Cannot delete item with invalid id ${id}`);
    return;
  }
  // Update model:
  items.splice(idx, 1);
  itemsById.delete(id);
  saveToStorage();
  // Update UI:
  let itemEl = document.getElementById("item-" + id);
  if (!itemEl) {
    console.error(`Cannot find item element with id ${id}`);
    return;
  }
  itemEl.remove();
}