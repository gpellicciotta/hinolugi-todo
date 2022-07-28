function domReady() {
  let prop = document.getElementById("box-shadow-property");
  let box = document.getElementById("box-shadow-preview");
  let boxColor = document.getElementById("box-color");
  let xPos = document.getElementById("x-pos");
  let yPos = document.getElementById("y-pos");
  let blur = document.getElementById("blur");
  let spread = document.getElementById("spread");
  let shadowColor = document.getElementById("shadow-color");
  let transparency = document.getElementById("transparency");

  let redrawFunc = () => {
    const transp = Math.min(Math.max(0, Math.floor((transparency.value / 100) * 255)), 255).toString(16).padStart(2, '0');
    const boxStyle = `${xPos.value}px ${yPos.value}px ${blur.value}px ${spread.value}px ${shadowColor.value}${transp}`;
    console.log(`redrawing box-shadow as ${boxStyle}`);
    box.style["box-shadow"] = boxStyle;
    box.style["background-color"] = boxColor.value;
    prop.innerText = `box-shadow: ${boxStyle};`
  };

  let addChangeEvent = (elem, changeFunc) => {
    elem.addEventListener("change", changeFunc);
    elem.addEventListener("keyup", changeFunc);
    elem.addEventListener("paste", changeFunc);
  };

  addChangeEvent(boxColor, redrawFunc);
  addChangeEvent(xPos, redrawFunc);
  addChangeEvent(yPos, redrawFunc);
  addChangeEvent(blur, redrawFunc);
  addChangeEvent(spread, redrawFunc);
  addChangeEvent(shadowColor, redrawFunc);
  addChangeEvent(transparency, redrawFunc);

  redrawFunc();
}

window.addEventListener("load", domReady, false);