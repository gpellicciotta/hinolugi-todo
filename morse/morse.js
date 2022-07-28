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
  console.debug(`Translating '${morseCodeText}' from morse code:`)
  let translated = '';
  let errors = [];
  // Prepare:
  morseCodeText = morseCodeText.replaceAll('-', '_'); // Dashes to underscores
  morseCodeSequence = '';
  morseCodeText = morseCodeText.replaceAll('/', '  '); // Explicit word separators become two spaces
  let morseCodeWords = morseCodeText.trim().split(/\s\s+/g);
  for (let word of morseCodeWords) {
    console.debug(`morse word '${word}'`);
    if (morseCodeSequence && (morseCodeSequence.charAt(morseCodeSequence.length - 1) !== '/')) {
      morseCodeSequence += '/';
    }
    let morseLetters = word.split(/\s/g);
    for (let letter of morseLetters) {
      let morseVal = reverseAlphabet[letter];
      console.debug(`morse letter '${letter}' -> '${morseVal}'`);
      if (morseVal) {
        translated += morseVal;
        if (morseCodeSequence && (morseCodeSequence.charAt(morseCodeSequence.length - 1) !== '/')) {
          morseCodeSequence += ' ';
        }
        morseCodeSequence += letter;
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

let morseCodeSequence;
let reverseAlphabet;
let morseUnitRegex;

function translateToMorseCode(normalText) {
  console.debug(`Translating '${normalText}' to morse code:`);
  morseCodeSequence = '';
  let translated = '';
  let errors = [];
  for (let i = 0; i < normalText.length; i++) {
    let ch = normalText.charAt(i).toUpperCase();
    let tr = morseAlphabet[ch];
    if (tr) {
      if (translated && (morseCodeSequence.charAt(morseCodeSequence.length - 1) !== '/')) {
        translated += ' '; // Letter-separator
        morseCodeSequence += ' ';
      }
      translated += `<span class="letter" data-letter="${escapeHTML(ch)}">${tr}</span>`;
      morseCodeSequence += tr;
    }
    else if (ch === ' ') { // Space = word-separator ==> end-result will be three spaces between words, two space at start or end
      translated += '<span class="word-separator"> / </span>';
      morseCodeSequence += '/';
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
      morseCodeSequence += ' ';
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
  else {
    morseCodeSequence = '';
  }
  let playButton = document.getElementById("play-button");
  if (morseCodeSequence) {
    playButton.classList.remove("disabled");
    playButton.removeAttribute("title");
  }
  else {
    playButton.classList.add("disabled");
    playButton.setAttribute("title", "Disabled because no morse sequence available");
  }
  translated.innerHTML = translatedText;
}

function playMorseCode() {
  if (!morseCodeSequence) { return ; }
  if (!audioCtx) { // Audio context must be created as result of a user gesture
    audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
  }
  const playButton = document.getElementById("play-button");
  const playFeedback = document.getElementById("play-feedback");
  playButton.classList.add("disabled");
  playButton.setAttribute("title", "Disabled because currently playing");
  let audioPromise = Promise.resolve();
  for (let code of morseCodeSequence) {
    console.info("Playing '" + code + "'");
    switch (code) {
      case '.':
        // Duration of dit = 1s 
        console.debug("  Beep for 1s");
        audioPromise = audioPromise.then(() => { playFeedback.classList.add("on"); });
        audioPromise = audioPromise.then(() => beep(250));
        audioPromise = audioPromise.then(() => { playFeedback.classList.remove("on"); }); 
        audioPromise = audioPromise.then(() => delay(250));
        break;
      case '_': 
        // Duration of dah = 3x duration of dit 
        console.debug("  Beep for 3s");
        audioPromise = audioPromise.then(() => { playFeedback.classList.add("on"); });
        audioPromise = audioPromise.then(() => beep(750));
        audioPromise = audioPromise.then(() => { playFeedback.classList.remove("on"); }); 
        audioPromise = audioPromise.then(() => delay(250));
        break;
      case ' ': 
        // Duration of letter space = 3x duration of dit
        console.debug("  Wait for 3s");
        audioPromise = audioPromise.then(() => delay(750));
        break;
      case '/': 
        // Duration of word space = 5x duration of dit
        console.debug("  Wait for 5s");
        audioPromise = audioPromise.then(() => delay(1250));
        break;
    }
  }
  audioPromise = audioPromise.then(() => { 
    playButton.removeAttribute("title");
    playButton.classList.remove("disabled"); 
  });
}

// See https://ourcodeworld.com/articles/read/1627/how-to-easily-generate-a-beep-notification-sound-with-javascript

const volume = 200;
const frequency = 1440;
let audioCtx = null;

/**
 * Helper function to wait the provided number of milliseconds.
 * 
 * @param {number} duration The number of millis to wait.
 * 
 * @returns {Promise} - A promise that resolves after the given number of millis.
 */
function delay(duration) {
  return new Promise((resolve) => {
    console.debug(`Waiting for ${duration}ms`);
    setTimeout(() => resolve(), duration);
  });
}

/**
 * Helper function to emit a beep sound in the browser using the Web Audio API.
 * 
 * @param {number} duration - The duration of the beep sound in milliseconds.
 * @param {number} frequency - The frequency of the beep sound.
 * @param {number} volume - The volume of the beep sound.
 * 
 * @returns {Promise} - A promise that resolves when the beep sound is finished.
 */
function beep(duration, frequency, volume) {
  return new Promise((resolve, reject) => {
    // Set default duration if not provided
    duration = duration || 200;
    frequency = frequency || 440;
    volume = volume || 20;
    
    try {
      let oscillatorNode = audioCtx.createOscillator();
      let gainNode = audioCtx.createGain();
      oscillatorNode.connect(gainNode);

      // Set the oscillator frequency in hertz
      oscillatorNode.frequency.value = frequency;

      // Set the type of oscillator
      oscillatorNode.type = "square";
      gainNode.connect(audioCtx.destination);

      // Set the gain to the volume
      gainNode.gain.value = volume * 0.01;

      // Start audio with the desired duration
      console.debug(`Beeping for ${duration}ms`);
      oscillatorNode.start(audioCtx.currentTime);
      oscillatorNode.stop(audioCtx.currentTime + (duration * 0.001));

      // Resolve the promise when the sound is finished
      oscillatorNode.onended = () => { resolve(); };
    } 
    catch (error) {
      reject(error);
    }
  });
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
    //console.debug(`Adding '${val}' <= '${key}'`);
    if (regex) {
      regex += '|';
    }
    regex += val.replace(/[.]/g, '[.]');
  }
  //console.debug(`The morse-unit regex is: ${regex}`);
  morseUnitRegex = new RegExp(regex, 'y');
  
  // Get input/output box elements:
  let input = document.getElementById("to-translate");
  let output = document.getElementById("translated");

  // Register function to run on any change of input
  registerInputChange(input, () => {
    translate(input, output); 
  });

  // Get play button + register 'click' action
  let playButton = document.getElementById("play-button");
  playButton.addEventListener('click', playMorseCode);

  // Ensure input has focus
  input.focus();
}