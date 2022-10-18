import { logger } from "./webslider-sdk/src/utils/logger/logger";

function importBuildTarget() {
  if (process.env.REACT_APP_TYPE === "player") {
    logger.debug("TARGET: PLAYER");
    return require("./player.tsx");
  } else if (process.env.REACT_APP_TYPE === "player-dev") {
    logger.debug("TARGET: PLAYER-DEV");
    return require("./player-dev-react.tsx");
  } else {
    logger.debug("TARGET: APPLICATION");
    return require("./application.tsx");
  }
}

importBuildTarget();

export {};
