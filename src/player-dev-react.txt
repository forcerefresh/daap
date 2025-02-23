import React from "react";
import { Player } from "./player/player/Player";

import "./objects/register-object";
import "./animations/register-animation";
import "./objects/font-preloader";

import ReactDOM from "react-dom";
import PlayerDev from "./player-dev/PlayerDev";

(window as any).WebSliderPlayer = Player;

//*** */

document.body.innerHTML += `
  <style>
  body {
    margin:0; padding: 0
    overflow:visible;
  }
  html{
    overflow:hidden;
  }
  </style>
`;

const playerHolderEl = document.createElement("div");
playerHolderEl.style.overflow = "visible";

document.body.appendChild(playerHolderEl);

ReactDOM.render(<PlayerDev />, playerHolderEl);

// let selectHtml = "<select id='selectSliderProject'>";
// selectHtml += "<option value=''>Select project</option>";
// exports.forEach((item) => {
//   selectHtml +=
//     "<option value='" + item.value + "'>" + item.label + "</option>";
// });
// selectHtml += "</select>";

// controlsEl.innerHTML += selectHtml;

// const refreshButtonHtml = "<button id='refreshButton'>Refresh</button>";
// controlsEl.innerHTML += refreshButtonHtml;

// const pauseButtonHtml = "<button id='pauseButton'>Pause</button>";
// controlsEl.innerHTML += pauseButtonHtml;

// let player: Player;
// let latestPlayerData: any;

// const selectEl = document.getElementById("selectSliderProject");
// selectEl?.addEventListener("change", (e: any) => {
//   const exportsData = JSON.parse(localStorage.getItem("exports") || "{}");
//   const selPlayerData = exportsData[e.target.value];
//   latestPlayerData = selPlayerData;

//   renderBreakpointButtons();

//   if (player) {
//     player.clear(true);
//   }

//   player = new Player(selPlayerData as any, playerRootEl);
//   player.play();
// });

// const refreshButtonEl = document.getElementById("refreshButton");
// refreshButtonEl?.addEventListener("click", (e: any) => {
//   if (player) {
//     player.clear(true);
//   }

//   player = new Player(latestPlayerData, playerRootEl);
//   player.play();
// });

// const pauseButtonEl = document.getElementById("pauseButton");
// pauseButtonEl?.addEventListener("click", (e: any) => {
//   if (player) {
//     player.setRootPaused(true);
//   }
// });

// let breakpointsBtns: HTMLDivElement;

// function renderBreakpointButtons() {
//   if (breakpointsBtns) {
//     breakpointsBtns.parentElement!.removeChild(breakpointsBtns);
//   }
//   breakpointsBtns = document.createElement("div");
//   controlsEl.appendChild(breakpointsBtns);

//   latestPlayerData.breakpoints.breakpointsConfiguration.forEach((bp: any) => {
//     addBbButton(breakpointsBtns, bp);
//   });
// }

// function addBbButton(holder: HTMLDivElement, bp: BreakpointConfiguration) {
//   const btnEl = document.createElement("button");
//   btnEl.innerHTML = `${bp.type}`;
//   btnEl.addEventListener("click", () => {
//     player?.setDevice(bp.type);
//   });
//   holder.appendChild(btnEl);
// }

//**** */
// const playerHolderEl = document.createElement("div");
// playerHolderEl.style.overflow = "visible";

// document.body.appendChild(playerHolderEl);

// const playerRootEl = document.createElement("div");
// playerRootEl.style.overflow = "visible";

// playerHolderEl.appendChild(playerRootEl);
