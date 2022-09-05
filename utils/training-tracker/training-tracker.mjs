document.addEventListener('DOMContentLoaded', onDomReady);

const EMPTY_STATE = {
  "training-schedules": { },
  "workout-diaries": { },
  "active-schedule": null,
  "active-diary": null
};

let trainingSchedules = { };
let workoutDiaries = { };
let activeScheduleName = null;
let activeWorkoutDiaryName = null;

function loadFromStorage() {
  // Load state:
  let stateJSON = localStorage.getItem('training-tracker');
  console.info("Loaded from storage: ", stateJSON);
  let state = stateJSON ? JSON.parse(stateJSON) : EMPTY_STATE;  
  // Fill state:
  trainingSchedules = state["training-schedules"] || { };
  workoutDiaries = state["workout-diaries"] || {};
  activeScheduleName = state["active-schedule"];
  activeWorkoutDiaryName = state["active-diary"];
}

function saveToStorage() {
  let state = {
    "training-schedules": trainingSchedules,
    "workout-diaries": workoutDiaries,
    "active-schedule": activeScheduleName,
    "active-diary": activeWorkoutDiaryName
  };  
  let stateJSON = JSON.stringify(state, ' ');
  try {
    localStorage.setItem('training-tracker', stateJSON);
    console.info("Saving to storage succeeded");
  }
  catch (error) {
    // TODO: show notification
    console.error('Failed to store state: ', error);
  }
}

function onDomReady() {

  //console.log("HMTS:", halfMarathonSchedule);

  // Add items from storage
  loadFromStorage();

  // Create UI from storage
  const activeScheduleSelectEl = document.getElementById("active-schedule");
  activeScheduleSelectEl.addEventListener("change", changeActiveSchedule);
  activeScheduleSelectEl.innerHTML = '';
  for (let schedule in trainingSchedules) {
    activeScheduleSelectEl.innerHTML += `<option value="${schedule}">${schedule}</option>`;
  }
  if (!activeScheduleName) {
    activeScheduleSelectEl.innerHTML += `<option value="None" selected>None</option>`;
  }
  else {
    activeScheduleSelectEl.value = activeScheduleName;
  }

  const activeDiarySelectEl = document.getElementById("active-diary");
  activeDiarySelectEl.addEventListener("change", changeActiveDiary);
  activeDiarySelectEl.innerHTML = '';
  for (let diary in workoutDiaries) {
    activeDiarySelectEl.innerHTML += `<option value="${diary}">${diary}</option>`;
  }
  if (!activeWorkoutDiaryName) {
    activeDiarySelectEl.innerHTML += `<option value="None" selected>None</option>`;
  }
  else {
    activeDiarySelectEl.value = activeWorkoutDiaryName;
  }

  // Re-build from storage
  const filesInputEl = document.getElementById("files-to-upload");
  filesInputEl.addEventListener("change", onUploadFiles);
  
  const loadButtonEl = document.getElementById("load");
  loadButtonEl.addEventListener("click", createItemList);
}

function changeActiveSchedule() {
  const activeScheduleSelectEl = document.getElementById("active-schedule");
  const selectedSchedule = activeScheduleSelectEl.value;
  if (selectedSchedule === activeScheduleName) {
    return ;
  }
  if (selectedSchedule in trainingSchedules) {
    activeScheduleName = selectedSchedule;
    console.log(`Active schedule is now '${activeScheduleName}'`);
  }
  else {
    activeScheduleName = null;
    console.log(`There is no longer an active schedule`);
  }
  saveToStorage();
}

function changeActiveDiary() {
  const activeDiarySelectEl = document.getElementById("active-diary");
  const selectedDiary = activeDiarySelectEl.value;
  if (selectedDiary === activeWorkoutDiaryName) {
    return;
  }
  console.log(`Selected diary: '${selectedDiary}'`);
  if (selectedDiary in workoutDiaries) {
    activeWorkoutDiaryName = selectedDiary;
    console.log(`Active diary is now '${activeWorkoutDiaryName}'`);
  }
  else {
    activeWorkoutDiaryName = null;
    console.log(`There is no longer an active diary`);
  }
  saveToStorage();
}

function onUploadFiles(event) {
  const filesInputEl = document.getElementById("files-to-upload");
  console.log(`files selected: ${filesInputEl.files.length}`);
  const files = filesInputEl.files;
  for (let i = 0, numFiles = files.length; i < numFiles; i++) {
    const file = files[i];
    uploadFile(file);
  }
}

function uploadFile(file) {
  console.log(`Uploading '${file.name}' with type ${file.type} and size ${file.size}`);
  const fr = new FileReader();
  fr.onload = (e) => {
    const content = e.target.result;
    const obj = JSON.parse(content);
    if (obj.hasOwnProperty("exercises")) {
      console.log("schedule file:", obj.name);
      if (trainingSchedules.hasOwnProperty(obj.name)) {
        console.warn(`Overwriting existing schedule '${obj.name}'`);
      }
      trainingSchedules[obj.name] = obj;
      saveToStorage();
    }
    else if (obj.hasOwnProperty("sessions")) {
      console.log("diary file:", obj.name);
      if (workoutDiaries.hasOwnProperty(obj.name)) {
        console.warn(`Overwriting existing diary '${obj.name}'`);
      }
      workoutDiaries[obj.name] = obj;
      saveToStorage();
    }
    else {
      console.log("unknown file:", content.substring(0, 20));
    }
  };
  fr.readAsText(file);
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
  let trainingEl = document.getElementById("training");
  trainingEl.innerHTML = ''; // Empty
  
  const activeSchedule = trainingSchedules[activeScheduleName];
  const activeDiary = workoutDiaries[activeWorkoutDiaryName];
  if (!activeSchedule) {
    console.log("No active schedule"); 
  }
  const nameToEl = new Map();
  for (let exercise of activeSchedule.exercises) {
    let newEl = addExerciseToList(exercise);
    nameToEl.set(exercise.name, newEl);
  }

  if (activeDiary) {
    console.log("Adding diary data:");
    for (let session of activeDiary.sessions) {
      console.log("Checking session:", session);
      if (session.ref.schedule === activeScheduleName) {
        const execEl = nameToEl.get(session.ref.exercise);
        if (execEl) {
          execEl.classList.add("performed");
        }
      }
    }
  }
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

function addExerciseToList(exercise) {
  let exerciseList = document.getElementById("training");
  console.log("Creating exercise element:", exercise);
  let newLiItem = document.createElement("li");
  newLiItem.setAttribute("id", exercise.name);
  newLiItem.dataset.trainingDayId = exercise.day;
  newLiItem.classList.add("training-day");
  newLiItem.innerHTML = `
    <span class="training-date">${exercise.name}</span>
    <span class="training-distance">${exercise.goals.distance[0]} ${exercise.goals.distance[1]}</span>
    <span class="training-description">${exercise.description}</span>
    <span class="training-data">
    </span>
    <span class="training-data-actions">
      <button class="icon-button" data-action="edit" title="Edit text"><i class="fa-solid fa-pen"></i></button>
      <button class="icon-button" data-action="delete" title="Delete item"><i class="fa-solid fa-trash"></i></button>
    </span>
  `;
  exerciseList.appendChild(newLiItem);
  return newLiItem;
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

  addItemToList(newItem); 
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
    let newNote = input.value;
    if (newNote !== item["note"]) {
      console.debug(`Input has changed: (new) '${newNote}' <> (old) '${item["note"]}'`);
      item["note"] = newNote;
      saveToStorage();
    }
    input.remove();
    itemTextEl.innerText = item["note"];
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