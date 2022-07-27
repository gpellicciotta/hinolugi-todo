document.addEventListener('DOMContentLoaded', onDomReady);

const morseAlphabet = {
  'A': '._',
  'B': '_...',
  'C': '_._.',
  'D': '_..',
  'E': '.',
  'F': '.._.',
  'G': '__.',
  'H': '....',
  'I': '..',
  'J': '.___',
  'K': '_._',
  'L': '._..',
  'M': '__',
  'N': '_.',
  'O': '___',
  'P': '.___',
  'Q': '__._',
  'R': '._.',
  'S': '...',
  'T': '_',
  'U': '.._',
  'V': '..._',
  'W': '.__',
  'X': '__..__',
  'Y': '_.__',
  'Z': '__..',
  '0': '_____',
  '1': '.____',
  '2': '..___',
  '3': '...__',
  '4': '...._',
  '5': '.....',
  '6': '_....',
  '7': '__...',
  '8': '___..',
  '9': '____.',
  '.': '._._._',
  ',': '__..__',
  '?': '..__..',
  '!': '_._.__',
  '-': '_...._',
  '/': '_.._.',
  ':': '___...',
  '\'': '.____.',
  '-': '_...._',
  ')': '_.__._',
  ';': '_._._',
  '(': '_.__.',
  '=': '_..._',
  '@': '.__._.',
  '&': '._...'
}

function translateFromMorseCode(morseCodeText) {
  console.log(`Translating '${morseCodeText}' from morse code:`)
  let translated = '';
  let errors = [];
  // Prepare:
  morseCodeText = morseCodeText.replaceAll('/', '  '); // Explicit word separators become two spaces
  morseCodeText = morseCodeText.replaceAll('-', '_'); // Dashes to underscores
  let morseCodeWords = morseCodeText.trim().split(/\s\s+/g);
  for (let word of morseCodeWords) {
    console.log(`morse word '${word}'`);
    let morseLetters = word.split(/\s/g);
    for (let letter of morseLetters) {
      let morseVal = reverseAlphabet[letter];
      console.log(`morse letter '${letter}' -> '${morseVal}'`);
      if (morseVal) {
        translated += morseVal;
      }
      else {
        translated += `<span class="error" data-error="Unrecognized morse-code '${letter}'">?</span>`;
        errors.push({
          input: letter
        });
        console.error(`Cannot translate morse-unit '${letter}'`);
      }
    }
    translated += ' ';
  }
  return [translated, errors];
}

let reverseAlphabet;
let morseUnitRegex;

function translateToMorseCode(normalText) {
  console.log(`Translating '${normalText}' to morse code:`);
  let translated = '';
  let errors = [];
  for (let i = 0; i < normalText.length; i++) {
    let ch = normalText.charAt(i).toUpperCase();
    let tr = morseAlphabet[ch];
    if (tr) {
      if (translated) {
        translated += ' '; // Letter-separator
      }
      translated += `<span class="letter" data-letter="${escapeHTML(ch)}">${tr}</span>`;
    }
    else if (ch === ' ') { // Space = word-separator ==> end-result will be three spaces between words, two space at start or end
      translated += '<span class="word-separator"></span>';
    }
    else {
      translated += `<span class="error" data-error="There is no morse-code for letter '${escapeHTML(ch)}'">?</span>`;
      console.error(`Cannot translate '${ch}' at index ${i} to morse-code`);
      errors.push( { 
          character: ch,
          index: i,
          input: normalText
        }
      );
      translated += ' ';
    }
  }
  return [translated, errors];
}

function escapeHTML(text) {
  const replacements = {
    '<': "&lt;", 
    '>': "&gt;", 
    '&': "&amp;", 
    '"': "&quot;"
  };                      
  return text.replace(/[<>&"]/g, function (character) {
    return replacements[character];
  });
}

function translate(toTranslate, translated) {
  let inputText = toTranslate.value;
  let translatedText = inputText || '';
  if (inputText) {
    let result = null;
    if (inputText.match(/^[._/ -]+$/g)) {
      result = translateFromMorseCode(inputText);
    }
    else {
      result = translateToMorseCode(inputText);
    }
    translatedText = result[0];
    let errors = result[1];
    if (errors && errors.length) {
      console.error(`${errors.length} errors occurred during translation`);
    }
  }
  translated.innerHTML = translatedText;
}

function registerInputChange(e, onFun) {
  e.addEventListener('input', onFun);
  e.addEventListener('change', onFun);
}

function onDomReady() {
  // Prepare lookup table + regex:
  reverseAlphabet = {};
  let regex = '';
  for (let key in morseAlphabet) {
    let val = morseAlphabet[key];
    reverseAlphabet[val] = key;
    //console.log(`Adding '${val}' <= '${key}'`);
    if (regex) {
      regex += '|';
    }
    regex += val.replace(/[.]/g, '[.]');
  }
  //console.log(`The morse-unit regex is: ${regex}`);
  morseUnitRegex = new RegExp(regex, 'y');
  
  // Get input/output box elements:
  let input = document.getElementById("to-translate");
  let output = document.getElementById("translated");

  // Register function to run on any change of input
  registerInputChange(input, () => {
    translate(input, output); 
  });

  // Ensure input has focus
  input.focus();
}