const EURO_TO_KUNA_XRATE = 7.5195;
const KUNA_TO_EURO_XRATE = 1 / EURO_TO_KUNA_XRATE;

export const BUILTIN_CONVERSIONS = {
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
  },
  "km/h to min/km": {
    "from-unit": "km/h",
    "from-unit-description": "kilometers per hour",
    "to-unit": "min/km",
    "to-unit-description": "minutes per kilometer",
    "conversion": (val) => { return 60 / val; } // x km/h => 1/x h/km => 60/x min/km
  },
  "min/km to km/h": {
    "from-unit": "min/km",
    "from-unit-description": "minutes per kilometer",
    "to-unit": "km/h",
    "to-unit-description": "kilometers per hour",
    "conversion": (val) => { return 60 / val; } //  x min/km  => 1/x km/min => 60/x km/h
  }
};
