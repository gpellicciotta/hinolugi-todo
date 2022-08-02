document.addEventListener('DOMContentLoaded', onDomReady);

const euroToKunaExchangeRate = 7.5195;
const kunaToEuroExchangeRate = 1 / euroToKunaExchangeRate;

function formatNumber(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

function fillExchangeTable() {
  let amount = document.getElementById("amount");
  let fromEuro = document.getElementById("from-euro");
  let toEuro = document.getElementById("to-euro");
  let fromKuna = document.getElementById("from-kuna");
  let toKuna = document.getElementById("to-kuna");

  let val = +amount.value;
  fromEuro.innerText = formatNumber(val);
  toKuna.innerText = formatNumber(val * euroToKunaExchangeRate);
  fromKuna.innerText = formatNumber(val);
  toEuro.innerText = formatNumber(val * kunaToEuroExchangeRate);
}

function registerInputChange(e, onFun) {
  e.addEventListener('input', onFun);
  e.addEventListener('change', onFun);
}

function onDomReady() {
  let e2k = document.getElementById("euro-to-kuna-exchange-rate");
  let k2e = document.getElementById("kuna-to-euro-exchange-rate");
  e2k.innerText = formatNumber(euroToKunaExchangeRate);
  k2e.innerText = formatNumber(kunaToEuroExchangeRate);

  // Get input/output box elements:
  let amount = document.getElementById("amount");

  // Register function to run on any change of input
  registerInputChange(amount, () => {
    fillExchangeTable();
  });

  // Ensure input has focus
  amount.focus();
}