import { makeReordable } from '/js/reorder.mjs';

document.addEventListener('DOMContentLoaded', onDomReady);

const DEFAULT_LIST_NAME = 'Default List';
const EMPTY_STATE = '{ "max-item-id": 99, "active-list": null, "lists": [ { "name": "Default List", "items": [] }] }';

let maxItemId = 99;
let activeList = DEFAULT_LIST_NAME; // must be key in lists
let lists = new Map();              // elements are: list name -> array of ordered list todo items
let items = [];                     // elements are: todo items for active list in order
let itemsById = new Map();          // all elements, over all lists

function loadFromStorage() {
  // Load state:
  let listsJSON = localStorage.getItem('todo-lists');
  if (!listsJSON) {
    let singleListJSON = localStorage.getItem('todo');
    if (singleListJSON) { // Old format, when there was only a single list
      console.info("Todo-lists have been loaded from old-format in storage: " + singleListJSON);
      let singleListState = JSON.parse(singleListJSON);
      activeList = DEFAULT_LIST_NAME;
      maxItemId = singleListState["max-item-id"] || 100;
      items = singleListState["items"] || [];
      lists.clear();
      lists.set(DEFAULT_LIST_NAME, { "name": DEFAULT_LIST_NAME, "items": items });
      activateList(activeList, true);
      return ;
    }
    else {
      listsJSON = EMPTY_STATE;
    }
  }
  // If we get here, we're working with the new format
  console.info("Todo lists have been loaded from storage: " + listsJSON);
  let state = JSON.parse(listsJSON);  
  maxItemId = state["max-item-id"] || 100;
  // Fill state:
  activeList = state["active-list"] || DEFAULT_LIST_NAME;
  lists.clear();
  items = [];
  itemsById.clear();
  (state["lists"] || []).forEach((list) => {
    console.log("Adding list " + list["name"]);
    lists.set(list["name"], list);
  });
  if (lists.length === 0) { // Create empty default list
    console.log("No lists found");
    lists.set(DEFAULT_LIST_NAME, { 'name': DEFAULT_LIST_NAME, 'items': [] });
  }
  // Now select active list
  activateList(activeList, true);
}

function saveToStorage() {
  const listsToStore = [];
  lists.forEach((list) => { listsToStore.push(list); });
  let state = {
    "max-item-id": maxItemId,
    "active-list": activateList,
    "lists": listsToStore
  };  
  let stateJSON = JSON.stringify(state, ' ');
  try {
    localStorage.setItem('todo-lists', stateJSON);
    console.info("Todo lists have been saved");
  }
  catch (error) {
    // TODO: show notification
    console.error('Failed to store state: ', error);
  }
}

function activateList(listName, updateListOptions) {
  const list = lists.get(listName);
  items = list.items;
  itemsById.clear();
  items.forEach((item) => { itemsById.set(item.id, item); });

  let selectOrCreateListEl = document.getElementById("select-or-create-list");
  if (updateListOptions) {
    selectOrCreateListEl.innerHTML = '';
    lists.forEach((list) => {
      let opt = document.createElement("option");
      opt.setAttribute("value", list.name);
      opt.innerText = list.name;
      selectOrCreateListEl.appendChild(opt);
    });
    let createOpt = document.createElement("option");
    createOpt.setAttribute("value", "[[create-new]]");
    createOpt.innerText = "-- create new list --";
    selectOrCreateListEl.appendChild(createOpt);
  }
  selectOrCreateListEl.value = listName;

  // Re-build from storage
  createItemList();

  // Ensure input has focus
  let newItemInput = document.getElementById("new-item");
  newItemInput.focus();
}

function onDomReady() {
  // Get add-item button + register 'click' action
  let addItemButton = document.getElementById("add-new-item");
  addItemButton.addEventListener('click', addNewItem);

  // Get new-item input + register 'enter' action
  let newItemInput = document.getElementById("new-item");
  newItemInput.addEventListener('keyup', (event) => {
    if (newItemInput.value && newItemInput.value.trim()) {
      addItemButton.classList.remove("disabled");
      addItemButton.setAttribute("title", "Create new todo item from item text");
      if (event.key === 'Enter') {
        addNewItem(event);
      }
    }
    else {
      addItemButton.classList.add("disabled");
      addItemButton.setAttribute("title", "Disabled because no item text is entered");      
    }
  });

  // Get settings-button + register 'click' action
  let settingsButton = document.getElementById("settings-button");
  settingsButton.addEventListener('click', toggleSettingsVisibility);

  // Get select-or-create-list + register 'change' action
  let selectOrCreateListItemEl = document.getElementById("select-or-create-list");
  selectOrCreateListItemEl.addEventListener('change', selectOrCreateList);

  // Get todo-list + register 'click' action
  let todoList = document.getElementById("todo-list");
  todoList.addEventListener('click', onListClick);
  document.body.addEventListener('click', onListClick);

  // Add items from storage
  loadFromStorage();

  // Update relative timestamps
  setTimeout(updateRelativeTimestamps, 15000);
}

function toggleSettingsVisibility() {
  let settingsDiv = document.getElementById("settings");
  settingsDiv.classList.toggle("closed");
}

function updateRelativeTimestamps() {
  document.querySelectorAll(".relative-time[data-timestamp]").forEach((relativeTimeEl) => {
    const newRelativeTimeText = dateTagFromIsoString(relativeTimeEl.dataset.timestamp);
    if (newRelativeTimeText !== relativeTimeEl.innerText) {
      relativeTimeEl.innerText = newRelativeTimeText;
    }
  });
  setTimeout(updateRelativeTimestamps, 15000);
}

function selectOrCreateList(event) {
  const selectOrCreateListItemEl = document.getElementById("select-or-create-list");
  const selectedOption = selectOrCreateListItemEl.options[selectOrCreateListItemEl.selectedIndex].value;
  if (selectedOption === '[[create-new]]') {
    alert("New list creation is not implemented yet");
  }
  else {
    activateList(selectedOption, false);
  }
}

function onListClick(event) {
  let targetElement = event.target;
  let actionElement = targetElement.closest("[data-action]");
  let itemElement = targetElement.closest(".item");
  if (actionElement && itemElement) {
    //console.debug("Click on target: " + targetElement.outerHTML + " within list element " + itemElement.outerHTML);
    if (actionElement && (actionElement.dataset.action === 'delete')) {
      event.stopPropagation();
      deleteItem(+itemElement.dataset.itemId);
    }
    else if (actionElement && (actionElement.dataset.action === 'toggle')) {
      event.stopPropagation();
      markItem(+itemElement.dataset.itemId);
    }
    else if (actionElement && (actionElement.dataset.action === 'edit')) {
      event.stopPropagation();
      makeItemEditable(+itemElement.dataset.itemId, itemElement);
    }
    else if (actionElement && (actionElement.dataset.action === 'copy')) {
      event.stopPropagation();
      const item = itemsById.get(+itemElement.dataset.itemId);
      const msg = `[${item["status"]}] ${item["note"]}`;
      if (!navigator.clipboard) {
        // Clipboard API not available
        console.error(`Clipboard not available to copy message: ${msg}`);
      }
      else {
        navigator.clipboard.writeText(msg)
          .then(() => {
            console.info(`Copied to clipboard: ${msg}`);
          })
          .catch(err => {
            console.error('Failed to copy to clipboard:', err);
          })
      }
    }
  }
  else if (itemElement) {
    if (!itemElement.classList.contains("selected")) {
      // De-select any currently selected element
      document.querySelectorAll(".item.selected").forEach(el => {
        el.classList.remove("selected");
      });
      // Select the current one
      itemElement.classList.add("selected");
    }
  }
  else { // Click on container
    // De-select any currently selected element
    document.querySelectorAll(".item.selected").forEach(el => {
      el.classList.remove("selected");
    });
  }
}

function createItemList() {
  let todoList = document.getElementById("todo-list");
  todoList.innerHTML = ''; // Empty
  items.forEach((item) => { addItemToList(item, false); } );
  makeReordable(todoList, reorderToDoList);
}

function addItemToList(item, isNewItem) {
  let todoList = document.getElementById("todo-list");

  let newLiItem = document.createElement("li");
  newLiItem.setAttribute("id", "item-" + item.id);
  newLiItem.dataset.itemId = item.id;
  newLiItem.classList.add("item");
  if (item.status === 'done') {
    newLiItem.classList.add("done");
  }
  newLiItem.innerHTML = `
    <label class="item-status" data-action="toggle"><i class="fa-solid fa-check"></i></label>
    <span class="item-text">${item["note"]}</span>
    <span class="item-tags">
      <span class="status tag" data-action="toggle">${item["status"]}</span>
      <span class="created tag relative-time" data-timestamp="${item["created-timestamp"]}">${dateTagFromIsoString(item["created-timestamp"])}</span>
      <span class="last-modified tag relative-time" data-timestamp="${item["last-modified-timestamp"]}">${dateTagFromIsoString(item["last-modified-timestamp"])}</span>
    </span>
    <span draggable="true" class="item-actions">
      <span class="icon-button" title="Drag to move item"><i class="fas fa-grip-lines"></i></span>
      <button class="icon-button" data-action="edit" title="Edit text"><i class="fa-solid fa-pen"></i></button>
      <button class="icon-button" data-action="copy" title="Copy to clipboard"><i class="fa-solid fa-copy"></i></button>
      <button class="icon-button" data-action="delete" title="Delete item"><i class="fa-solid fa-trash"></i></button>
    </span>
  `;
  if (isNewItem) {
    todoList.prepend(newLiItem);
  }
  else {
    todoList.appendChild(newLiItem);
  }
}

function getDateParts(date) {
  return {
    'year': date.getFullYear(),
    'month': (1 + date.getMonth()),
    'day': date.getDate(),
    'hour': date.getHours(),
    'minute': date.getMinutes(),
    'second': date.getSeconds(),
    'millis': date.getMilliseconds(),
    'timezone-offset': date.getTimezoneOffset()
  }
}

function areOnSameDay(date1, date2) {
  const date1Parts = getDateParts(date1);
  const date2Parts = getDateParts(date2);
  return (date1Parts.year === date2Parts.year) && (date1Parts.month === date2Parts.month) && (date1Parts.day === date2Parts.day);
}

function areOnSameHour(date1, date2) {
  const date1Parts = getDateParts(date1);
  const date2Parts = getDateParts(date2);
  return (date1Parts.year === date2Parts.year) && (date1Parts.month === date2Parts.month) && (date1Parts.day === date2Parts.day) && (date1Parts.hour === date2Parts.hour);
}

function areOnSameMinute(date1, date2) {
  const date1Parts = getDateParts(date1);
  const date2Parts = getDateParts(date2);
  return (date1Parts.year === date2Parts.year) && (date1Parts.month === date2Parts.month) && (date1Parts.day === date2Parts.day) && (date1Parts.hour === date2Parts.hour) && (date1Parts.minute === date2Parts.minute);
}

function localTimeString(date) {
  const dateParts = getDateParts(date);
  return `${dateParts.year}-${formatNumber(dateParts.month, 2)}-${formatNumber(dateParts.day, 2)} ${formatNumber(dateParts.hour, 2)}:${formatNumber(dateParts.minute, 2)}`;
}

function relativeLocalTimeString(date) {
  const dateMillisSinceEpoch = date.getTime();
  const dateParts = getDateParts(date);
  const now = new Date();
  const nowParts = getDateParts(now);
  const nowMillisSinceEpoch = now.getTime(); 
  const secondsDiff = Math.floor(Math.abs(nowMillisSinceEpoch - dateMillisSinceEpoch) / 1000);
  if ((dateParts.year === nowParts.year) && (dateParts.month === nowParts.month) && (dateParts.day === nowParts.day)) { // Same day
    if (dateParts.hour === nowParts.hour) { // Same hour
      if (dateParts.minute === nowParts.minute) { // Same minute
        if (secondsDiff) {
          return `${secondsDiff}s ago`;
        }
        else {
          return 'just now';
        }
      }
      else {
        const minutesDiff = Math.floor(secondsDiff / 60);
        if (minutesDiff <= 1) {
          return '1 minute ago';
        }
        else {
          return `${minutesDiff} minutes ago`;
        }
      }
    }
    else { // Same day
      return `${dateParts.hour}:${formatNumber(dateParts.minute, 2)}`;
    }
  }
  // Not same day:
  return `${dateParts.year}-${formatNumber(dateParts.month, 2)}-${formatNumber(dateParts.day, 2)}`;
}

function formatNumber(num, size) {
  return String(num).padStart(size, '0');
}

function dateTagFromIsoString(isoString) {
  let d = new Date(isoString);
  return relativeLocalTimeString(d);
}

function addNewItem(event) {
  let newItemInput = document.getElementById("new-item");
  let itemText = (newItemInput.value || '').trim();
  if (!itemText) {
    console.warn("Cannot add todo-item with no text");
    return ;
  }
  let itemId = (++maxItemId);
  let creationDate = new Date();
  let newItem = {
    "id": itemId,
    "status": "todo",
    "note": itemText,
    "created-timestamp": creationDate.toISOString(),
    "last-modified-timestamp": creationDate.toISOString(),
  };
  items.unshift(newItem); // = add to beginning
  itemsById.set(newItem.id, newItem);
  saveToStorage();

  addItemToList(newItem, true); 
  newItemInput.value = '';
  newItemInput.focus();

  let todoList = document.getElementById("todo-list");
  makeReordable(todoList, reorderToDoList);
}

function reorderToDoList() {
  let reorderedItems = [];
  let itemEls = document.getElementById("todo-list").children;
  for (var i = 0; i < itemEls.length; i++) {
    const itemEl = itemEls[i];
    const itemId = +itemEl.dataset.itemId;
    const item = itemsById.get(itemId);
    if (!item) {
      console.error("failed to determine new item order due to missing item for ID#" + itemId, itemEl);
      return;
    }
    reorderedItems.push(item);
  }
  // Save
  items = reorderedItems;
  saveToStorage();
}

function indexOfItem(id) {  
  for (let i = 0; i < items.length; i++) {  
    if (items[i].id === id) {
      return i;
    }
  }
  return -1;
}

function makeItemEditable(id, itemEl) {
  console.info(`Trying to make item with id ${id} editable`);
  let item = itemsById.get(id)
  if (!item) {
    console.error(`Cannot make item editable with invalid id ${id}`);
    return ;
  }
  let itemTextEl = itemEl.querySelector(".item-text");
  if (!itemTextEl) {
    console.error(`Cannot find text element for:`, itemEl);
    return;
  }
  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.value = item["note"];
  const onInputChanged = (ev) => {
    ev.stopPropagation();
    if (input == null) { return; } // Already invoked
    let newNote = (input.value || '').trim();
    if (!newNote) {
      console.warn("Cannot change note to empty text: delete the item if that is what is desired");
    }
    if (newNote && (newNote !== item["note"])) {
      console.debug(`Input has changed: (new) '${newNote}' <> (old) '${item["note"]}'`);
      item["note"] = newNote;
      item["last-modified-timestamp"] = new Date().toISOString(); 
      saveToStorage();
    }
    input.remove();
    itemTextEl.innerText = item["note"];
    let lastModifiedEl = itemEl.querySelector(".tag.last-modified");
    if (!lastModifiedEl) {
      console.error(`Cannot find last-modified child tag element for item with id ${id}`);
      return;
    }
    lastModifiedEl.dataset.timestamp = item["last-modified-timestamp"];
    lastModifiedEl.innerText = dateTagFromIsoString(item["last-modified-timestamp"]);
  };
  input.addEventListener("blur", onInputChanged);
  input.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      input.blur();
    }
  });
  itemTextEl.innerHTML = '';
  itemTextEl.appendChild(input);
  //console.debug("Input element created for editing");
  input.focus();
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
  let statusTagEl = itemEl.querySelector(".tag.status");
  if (!statusTagEl) {
    console.error(`Cannot find status tag child tag element for item with id ${id}`);
    return;
  }
  statusTagEl.innerText = item["status"];
  let lastModifiedEl = itemEl.querySelector(".tag.last-modified");
  if (!lastModifiedEl) {
    console.error(`Cannot find last-modified child tag element for item with id ${id}`);
    return;
  }
  lastModifiedEl.dataset.timestamp = item["last-modified-timestamp"];
  lastModifiedEl.innerText = dateTagFromIsoString(item["last-modified-timestamp"]);
}

function confirmDelete(title, text) {
  return confirm(text);
}

function deleteItem(id) {
  console.info(`Trying to delete item with id ${id}`);
  let idx = indexOfItem(id);
  if (idx < 0) {
    console.error(`Cannot delete item with invalid id ${id}`);
    return;
  }
  let itemToDelete = items[idx];
  // Ask confirmation
  if (!confirmDelete('Confirm Delete', `Are you sure you want to delete the todo item '${itemToDelete["note"]}'?`)) {
    return ;
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