import React from "react";
//import ReactDOM from "react-dom";

function importBuildTarget() {
  // DefinePlugin in webpack.config.js will substitute
  // process.env.REACT_APP_BUILD_TARGET with it's value at build time.
  // https://webpack.js.org/plugins/define-plugin/

  // TerserPlugin in webpack.config.js will eliminate dead code
  // ...if we make it easy enough (no maps or switches, etc).
  // https://webpack.js.org/plugins/terser-webpack-plugin/

  if (process.env.REACT_APP_TYPE === "player") {
    console.log("PLAYER");
    return require("./player.tsx");
  } else if (process.env.REACT_APP_TYPE === "player-dev") {
    console.log("PLAYER-DEV");
    return require("./player-dev.tsx");
  } else {
    console.log("APPLICATION");
    return require("./application.tsx");
  }
}

// Import the entry point and render it's default export
//importBuildTarget().then(({ default: Environment }) =>

importBuildTarget();

/*
if (importData.default) {
  const data = importData.default();
  ReactDOM.render(
    data.component,
    document.getElementById((data.useAppRootSelector as any)())
  );
}
//);
*/
