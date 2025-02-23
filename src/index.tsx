import {
  logger,
  LoggerDomain,
  showLoggerUsage,
} from "webslider-sdk/lib/utils/logger/logger";
console.log("asdsad");

console.log(import.meta.env.VITE_APP_TYPE);
console.log(import.meta.env);

function importBuildTarget() {
  if (import.meta.env.VITE_APP_TYPE === "player") {
    logger.app.log("Module: WebSlider Player (player)");
    showLoggerUsage(LoggerDomain.Player);
    // return require("./player.tsx");
  } else if (import.meta.env.VITE_APP_TYPE === "player-dev") {
    logger.app.log("Module: WebSlider Player For Development (player-dev)");
    showLoggerUsage(LoggerDomain.Player);
    // return require("./player-dev-react.tsx");
  } else if (import.meta.env.VITE_APP_INTEGRATION === "saas") {
    logger.app.log("Module: Web Slider Application (application:saas)");
    showLoggerUsage(LoggerDomain.App);
    return require("./application-saas.tsx");
  } else {
    logger.app.log("Module: Web Slider Application (application)");
    showLoggerUsage(LoggerDomain.App);
    // return require("./application.tsx");
  }
}

importBuildTarget();

export {};
