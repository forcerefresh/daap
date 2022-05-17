import { Player } from "./player/player/Player";

import "./objects/register-object";
import { BreakpointConfiguration } from "./store/reducers/i-settings";
require("./effects/effects");

(window as any).WebSliderPlayer = Player;

//*** */
const exports = getExports();
document.body.innerHTML += `<style>
body {
   margin:0; padding: 0
   overflow:visible;
}
html{
  overflow:hidden;
}
.controlsHolder{
  opacity: 0.5;
  position:absolute;
  z-index:10000;
}
</style>`;

const controlsEl = document.createElement("div");
controlsEl.className = "controlsHolder";
document.body.appendChild(controlsEl);

let selectHtml = "<select id='selectSliderProject'>";
selectHtml += "<option value=''>Select project</option>";
exports.forEach((item) => {
  selectHtml +=
    "<option value='" + item.value + "'>" + item.label + "</option>";
});
selectHtml += "</select>";

controlsEl.innerHTML += selectHtml;

const refreshButtonHtml = "<button id='refreshButton'>Refresh</button>";
controlsEl.innerHTML += refreshButtonHtml;

let player: Player;
let latestPlayerData: any;

const selectEl = document.getElementById("selectSliderProject");
selectEl?.addEventListener("change", (e: any) => {
  const exportsData = JSON.parse(localStorage.getItem("exports") || "{}");
  const selPlayerData = exportsData[e.target.value];
  latestPlayerData = selPlayerData;
  console.log(selPlayerData);
  console.log(exportsData);
  console.log(e.target.value);

  renderBreakpointButtons();

  if (player) {
    player.clear(true);
  }

  player = new Player(selPlayerData as any, divEl);
  player.play();
});

const refreshButtonEl = document.getElementById("refreshButton");
refreshButtonEl?.addEventListener("click", (e: any) => {
  if (player) {
    player.clear(true);
  }

  player = new Player(latestPlayerData, divEl);
  player.play();
});

let breakpointsBtns: HTMLDivElement;

function renderBreakpointButtons() {
  if (breakpointsBtns) {
    breakpointsBtns.parentElement!.removeChild(breakpointsBtns);
  }
  breakpointsBtns = document.createElement("div");
  controlsEl.appendChild(breakpointsBtns);

  latestPlayerData.breakpoints.breakpointsConfiguration.forEach((bp: any) => {
    console.log(bp);
    addBbButton(breakpointsBtns, bp);
  });
}

function addBbButton(holder: HTMLDivElement, bp: BreakpointConfiguration) {
  const btnEl = document.createElement("button");
  btnEl.innerHTML = `${bp.type}`;
  btnEl.addEventListener("click", () => {
    player?.setDevice(bp.type);
  });
  holder.appendChild(btnEl);
}

//**** */
const divEl = document.createElement("div");
divEl.style.overflow = "visible";

document.body.appendChild(divEl);

function getExports() {
  const exports = JSON.parse(localStorage.getItem("exports") || "{}");
  const keys = Object.keys(exports);

  console.log(keys);

  const options: { label: string; value: string }[] = [];
  keys.forEach((key) => {
    const data = exports[key];
    options.push({ label: data.name, value: key });
  });
  console.log(options);
  return options;
}
