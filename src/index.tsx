import {
  logger,
  LoggerDomain,
  showLoggerUsage,
} from "webslider-sdk/lib/utils/logger/logger";

logger.app.log("Module: Web Slider Application");
showLoggerUsage(LoggerDomain.App);

import("@platform/application");

export {};
