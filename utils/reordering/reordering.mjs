// See also: https://www.youtube.com/watch?v=wv7pvH1O5Ho
import { makeReordable } from '/js/reorder.mjs';

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

  makeReordable(listEl);
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

function addChangeEvent(elem, changeFunc) {
  elem.addEventListener("change", changeFunc);
  elem.addEventListener("keyup", changeFunc);
  elem.addEventListener("paste", changeFunc);
} 