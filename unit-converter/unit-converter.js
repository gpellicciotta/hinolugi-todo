document.addEventListener('DOMContentLoaded', onDomReady);

// Constants and builtin data:

const EURO_TO_KUNA_XRATE = 7.5195;
const KUNA_TO_EURO_XRATE = 1 / EURO_TO_KUNA_XRATE;

const BUILTIN_CONVERSIONS = {
  "kuna to euro": {
    "from-unit": "HRK",
    "from-unit-description": "Kuna",
    "to-unit": "€",
    "to-unit-description": "Euro",
    "conversion": (val) => { return val * KUNA_TO_EURO_XRATE; }
  },
  "euro to kuna": {
    "from-unit": "€",
    "from-unit-description": "Euro",
    "to-unit": "HRK",
    "to-unit-description": "Kuna",
    "conversion": (val) => { return val * EURO_TO_KUNA_XRATE; }
  },
  "celsius to fahrenheit": {
    "from-unit": "°C",
    "from-unit-description": "degrees Celsius",
    "to-unit": "°F",
    "to-unit-description": "degrees Fahrenheit",
    "conversion": (val) => { return (val * (9/5)) + 32; }
  },
  "fahrenheit to celsius": {
    "from-unit": "°F",
    "from-unit-description": "degrees Fahrenheit",
    "to-unit": "°C",
    "to-unit-description": "degrees Celsius",
    "conversion": (val) => { return (val - 32) * (5/9); }
  }
};

const EMPTY_STATE = '{}';

// State:

let availableConversions = { };
let selectedConversions = [ ];

function loadFromStorage() {
  // Load state:
  let stateJSON = localStorage.getItem('unit-converter') || EMPTY_STATE;
  console.info("Loaded from storage: " + stateJSON);
  let state = JSON.parse(stateJSON);
  // Fill state:
  availableConversions = (state["available-conversions"] && state["available-conversions"].length) || BUILTIN_CONVERSIONS;
  selectedConversions = state["selected-conversions"] || ["kuna to euro", "euro to kuna" ];
}

function saveToStorage() {
  let state = {
    "available-conversions": availableConversions,
    "selected-conversions": selectedConversions
  };
  let stateJSON = JSON.stringify(state, ' ');
  try {
    localStorage.setItem('unit-converter', stateJSON);
    console.info("Saving to storage succeeded");
  }
  catch (error) {
    // TODO: show notification
    console.error('Failed to store state: ', error);
  }
}

function formatNumber(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

function recalculate() {
  // Get amount
  let amount = document.getElementById("amount");
  let val = +amount.value;

  // Re-set list of available conversions:
  let availableConversionsDataList = document.getElementById("available-conversions");
  availableConversionsDataList.innerHTML = "";
  for (ac in availableConversions) {
    let optEl = document.createElement("option");
    optEl.setAttribute("value", ac);
    availableConversionsDataList.appendChild(optEl);
  }

  // Re-set list of actual (= selected) conversions:
  let convList = document.getElementById("conversions");
  convList.innerHTML = "";
  selectedConversions.forEach((cn, idx) => {
    let conv = availableConversions[cn];
    if (!conv) {
      console.error(`Invalid conversion '${cn}' selected`);
      return ;
    }
    let convVal = conv.conversion(val);
    let liEl = document.createElement("tr");
    liEl.setAttribute("data-index", idx);
    liEl.innerHTML = `
      <td class="from-value">${formatNumber(val)}</td>
      <td class="from-unit" title="${conv["from-unit-description"]}">${conv["from-unit"]}</td>
      <td class="equal-sign">=</td>
      <td class="to-value">${formatNumber(convVal)}</td>
      <td class="to-unit" title="${conv["to-unit-description"]}">${conv["to-unit"]}</td>
      <td class="actions"><button class="icon-button" data-action="delete" title="Delete"><i class="fa-solid fa-trash"></i></button></td>
    `;
    convList.appendChild(liEl);
  });
}

function registerInputChange(e, onFun) {
  e.addEventListener('input', onFun);
  e.addEventListener('change', onFun);
}

function onDomReady() {
  // Get input/output box elements:
  let amount = document.getElementById("amount");

  // Register function to run on any change of input
  registerInputChange(amount, () => {
    recalculate();
  });

  // Get output table + register 'click' action
  let conversionsTable = document.getElementById("conversions");
  conversionsTable.addEventListener('click', onConversionsListClick);

  // Get add button + register 'click' action
  let addButton = document.getElementById("add-button");
  addButton.addEventListener('click', onAddConversionClick);

  // Add items from storage
  loadFromStorage();

  // Re-build from storage
  recalculate();

  // Ensure input has focus
  amount.focus();
}

function onAddConversionClick(event) {
  event.stopPropagation();
  let selectInput = document.getElementById("select-conversion-input");
  let selectedConversion = selectInput.value;
  selectInput.value = "";
  if (!selectedConversion || !availableConversions[selectedConversion]) {
    console.error(`Invalid conversion '${selectedConversion}' selected`);
  }
  selectedConversions.push(selectedConversion);
  saveToStorage();
  recalculate();
}

function onConversionsListClick(event) {
  let targetElement = event.target;
  let actionElement = targetElement.closest("[data-action]");
  let trElement = targetElement.closest("tr");
  console.debug("Click on target: " + targetElement.outerHTML + " within tr element " + trElement.outerHTML);
  if (actionElement && (actionElement.dataset.action === 'delete') && (actionElement === document.activeElement)) {
    event.stopPropagation();
    const idx = +trElement.dataset.index;
    selectedConversions.splice(idx, 1);
    saveToStorage();
    recalculate();
  }
}

function selectConversionToList(item) {
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