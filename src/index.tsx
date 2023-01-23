import {
  logger,
  LoggerDomain,
  showLoggerUsage,
} from "webslider-sdk/lib/utils/logger/logger";

function importBuildTarget() {
  if (process.env.REACT_APP_TYPE === "player") {
    logger.app.log("Module: WebSlider Player (player)");
    showLoggerUsage(LoggerDomain.Player);
    return require("./player.tsx");
  } else if (process.env.REACT_APP_TYPE === "player-dev") {
    logger.app.log("Module: WebSlider Player For Development (player-dev)");
    showLoggerUsage(LoggerDomain.Player);
    return require("./player-dev-react.tsx");
  } else {
    logger.app.log("Module: Web Slider Application (application)");
    showLoggerUsage(LoggerDomain.App);
    return require("./application.tsx");
  }
}

importBuildTarget();

export {};
