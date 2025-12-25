import {
  logger,
  LoggerDomain,
  showLoggerUsage,
} from "webslider-sdk/lib/utils/logger/logger";

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
    // return require("./application-saas.tsx");
    import("./application-saas.tsx").then((module) => {
      //AppComponent = module.default;
    });
  } else if (import.meta.env.VITE_APP_INTEGRATION === "wp") {
    logger.app.log("Module: Web Slider Application (application:wp)");
    showLoggerUsage(LoggerDomain.App);

    import("./application-wp.tsx").then((module) => {
      // AppComponent = module.default;
    });
  }
}

importBuildTarget();

export {};
