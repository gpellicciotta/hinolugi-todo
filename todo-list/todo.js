document.addEventListener('DOMContentLoaded', onDomReady);

const DEMO_ITEMS = [
  {
    "id": "item-1",
    "status": "done",
    "note": "Setup a new project",
    "created-timestamp": "2022-07-07T14:14:00",
    "last-modified-timestamp": "2022-07-07T14:16:00",
  },
  {
    "id": "item-2",
    "status": "active",
    "note": "Make it work",
    "created-timestamp": "2022-07-07T14:16:30",
    "last-modified-timestamp": "2022-07-07T14:16:30",
  },
  {
    "id": "item-4",
    "status": "todo",
    "note": "Add browser-based local persistance",
    "created-timestamp": "2022-07-07T14:17:00",
    "last-modified-timestamp": "2022-07-07T14:17:00",
  },
];

let maxItemId = 100;

function getTodoItemsFromStorage() {
  // TODO: real implementation
  return DEMO_ITEMS;
}

function onDomReady() {
  // Get add-item button + register 'click' action
  let addItemButton = document.getElementById("add-new-item");
  addItemButton.addEventListener('click', addNewItem);

  // Add items from storage
  let todoList = document.getElementById("todo-list");
  todoList.innerHTML = ''; // Empty

  let todoItems = getTodoItemsFromStorage();
  todoItems.forEach(addItem);

  // Ensure input has focus
  let newItemInput = document.getElementById("new-item");
  newItemInput.focus();
}

function addItem(item) {
  let todoList = document.getElementById("todo-list");

  let newLiItem = document.createElement("li");
  newLiItem.setAttribute("id", item["id"]);
  newLiItem.classList.add("item");
  newLiItem.innerHTML = `
    <label id="${item["id"]}-checkbox-label"><i class="fa-solid fa-check"></i><input type="checkbox" id="${item["id"]}-checkbox"></label>
    <div class="item-content">
      <span class="note">${item["note"]}</span>
      <div class="tags">
        <span class="status tag">done</span>
        <span class="created tag">${item["created-timestamp"]}</span>
        <span class="last-modified tag">${item["last-modified-timestamp"]}</span>
      </div>
    </div>
    <button class="icon-button" id="${item["id"]}-delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
  `;
  todoList.appendChild(newLiItem);

  let deleteButton = document.getElementById(item["id"] + "-delete");
  deleteButton.addEventListener("click", () => {
    newLiItem.remove();
  });

  let checkbox = document.getElementById(item["id"] + "-checkbox");
  checkbox.addEventListener("click", () => {
    if (checkbox.checked) {
      newLiItem.classList.add("done");
    }
    else {
      newLiItem.classList.remove("done");
    }
  });
}

function addNewItem(event) {
  let newItemInput = document.getElementById("new-item");
  let itemText = newItemInput.value;
  let itemId = "item-" + (maxItemId++);
  let creationDate = new Date();
  let newItem = {
    "id": itemId,
    "status": "todo",
    "note": itemText,
    "created-timestamp": creationDate.toISOString(),
    "last-modified-timestamp": creationDate.toISOString(),
  };
  addItem(newItem);
  newItemInput.value = '';
  newItemInput.focus();
}

function markItem(event) {

}

function deleteItem(event) {

}