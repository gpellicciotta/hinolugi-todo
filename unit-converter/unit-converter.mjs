import { makeReordable } from '../reorder.mjs';

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
  },
  "kilometers to miles": {
    "from-unit": "km",
    "from-unit-description": "SI kilometers",
    "to-unit": "mi.",
    "to-unit-description": "imperial miles",
    "conversion": (val) => { return val / 1.609344; }
  },
  "miles to kilometers": {
    "from-unit": "mi.",
    "from-unit-description": "imperial miles",
    "to-unit": "km",
    "to-unit-description": "SI kilometers",
    "conversion": (val) => { return val * 1.609344; }
  },
  "meters to yards": {
    "from-unit": "m",
    "from-unit-description": "SI meters",
    "to-unit": "yd",
    "to-unit-description": "imperial yards",
    "conversion": (val) => { return val / 0.9144; }
  },
  "yards to meters": {
    "from-unit": "yd",
    "from-unit-description": "imperial yards",
    "to-unit": "m",
    "to-unit-description": "SI meters",
    "conversion": (val) => { return val * 0.9144; }
  },
  "centimeters to inches": {
    "from-unit": "cm",
    "from-unit-description": "SI centimeters",
    "to-unit": "in",
    "to-unit-description": "imperial inches",
    "conversion": (val) => { return val / 2.54; }
  },
  "inches to centimeters": {
    "from-unit": "in",
    "from-unit-description": "imperial inches",
    "to-unit": "cm",
    "to-unit-description": "SI centimeters",
    "conversion": (val) => { return val * 2.54; }
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
  for (let ac in availableConversions) {
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
    let divEl = document.createElement("div");
    divEl.classList.add("conversion");
    divEl.setAttribute("data-index", idx);
    divEl.innerHTML = `
      <span class="conversion-title">${cn}</span>  
      <span class="from-value">${formatNumber(val)}</span>
      <span class="from-unit" title="${conv["from-unit-description"]}">${conv["from-unit"]}</span>
      <span class="equal-sign">=</span>
      <span class="to-value">${formatNumber(convVal)}</span>
      <span class="to-unit" title="${conv["to-unit-description"]}">${conv["to-unit"]}</span>
      <span class="actions">
        <span draggable="true" title="Drag to move item"><i class="fas fa-grip-lines"></i></span>
        <button class="icon-button" data-action="copy" title="Copy to clipboard"><i class="fa-solid fa-copy"></i></button>    
        <button class="icon-button" data-action="delete" title="Delete conversion"><i class="fa-solid fa-trash"></i></button>
      </span>
    `;
    convList.appendChild(divEl);
  });
  makeReordable(convList, reorderSelectedConversions);
}

function reorderSelectedConversions() {
  let reorderedConversions = [];
  let newIndexes = []; // Position corresponds to old index, value to new index
  let selectedConversionEls = document.getElementById("conversions").children;
  for (var i = 0; i < selectedConversionEls.length; i++) {
    const convEl = selectedConversionEls[i];
    const origIdx = convEl.dataset.index;
    const origConvName = selectedConversions[origIdx];
    if (!origConvName) {
      console.error("failed to determine new selected conversion order due to missing name for: ", convEl);
      return;
    }
    const newIdx = reorderedConversions.length;
    convEl.dataset.newIndex = newIdx;
    reorderedConversions.push(origConvName);
  }
  selectedConversions = reorderedConversions;
  // Now also update the 'data-index' attributes for all visual elements
  // Only do now since we might fail out completely earlier
  for (var i = 0; i < selectedConversionEls.length; i++) {
    const convEl = selectedConversionEls[i];
    convEl.dataset.index = convEl.dataset.newIndex;
  }
  // Save
  saveToStorage();
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
  document.body.addEventListener('click', onConversionsListClick);

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
  let convElement = targetElement.closest(".conversion");
  if (actionElement && convElement) {
    console.debug("Click on target: " + targetElement.outerHTML + " within tr element " + convElement.outerHTML);
    if (actionElement && (actionElement.dataset.action === 'delete') && (actionElement === document.activeElement)) {
      event.stopPropagation();
      const idx = +convElement.dataset.index;
      selectedConversions.splice(idx, 1);
      saveToStorage();
      recalculate();
    }
    else if (actionElement && (actionElement.dataset.action === 'copy') && (actionElement === document.activeElement)) {
      event.stopPropagation();
      const fromVal = convElement.querySelector(".from-value").innerText;
      const fromUnit = convElement.querySelector(".from-unit").innerText;
      const toVal = convElement.querySelector(".to-value").innerText;
      const toUnit = convElement.querySelector(".to-unit").innerText;
      const msg = `${fromVal} ${fromUnit} = ${toVal} ${toUnit}`;
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
  else if (convElement) {
    if (!convElement.classList.contains("selected")) {
      // De-select any currently selected element
      document.querySelectorAll(".conversion.selected").forEach(el => {
        el.classList.remove("selected");
      });
      // Select the current one
      convElement.classList.add("selected");
    }
  }
  else { // Click on container
    // De-select any currently selected element
    document.querySelectorAll(".conversion.selected").forEach(el => {
      el.classList.remove("selected");
    });
  }
}
