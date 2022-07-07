function importBuildTarget() {
  if (process.env.REACT_APP_TYPE === "player") {
    console.log("TARGET: PLAYER");
    return require("./player.tsx");
  } else if (process.env.REACT_APP_TYPE === "player-dev") {
    console.log("TARGET: PLAYER-DEV");
    return require("./player-dev.tsx");
  } else {
    console.log("TARGET: APPLICATION");
    return require("./application.tsx");
  }
}

importBuildTarget();

export {};
