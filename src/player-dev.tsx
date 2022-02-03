import { Player } from "./player/player/Player";

require("./effects/effects");

(window as any).WebSliderPlayer = Player;

//*** */
const exports = getExports();

let selectHtml = "<select id='selectSliderProject'>";
selectHtml += "<option value=''>Select project</option>";
exports.forEach((item) => {
  selectHtml +=
    "<option value='" + item.value + "'>" + item.label + "</option>";
});
selectHtml += "</select>";

document.body.innerHTML += selectHtml;

const selectEl = document.getElementById("selectSliderProject");
selectEl?.addEventListener("change", (e: any) => {
  const exportsData = JSON.parse(localStorage.getItem("exports") || "{}");
  const selPlayerData = exportsData[e.target.value];
  console.log(selPlayerData);
  console.log(exportsData);
  console.log(e.target.value);

  const player = new Player(selPlayerData as any, divEl);
  player.play();
});
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
