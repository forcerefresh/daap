import { addExtensionCode } from "../integration/utils/load-extension";
import {
  isAnimationRegistered,
  registerExternalAnimation,
} from "webslider-sdk/lib/animations/animations-register";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import {
  isObjectRegistered,
  registerExternalObject,
} from "webslider-sdk/lib/objects/objects-register";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getGlobals } from "../globals";

export async function loadAndRegisterExternalComponent(
  extension: IExtensionItem
) {
  if (
    extension.extensionType === "object" &&
    isObjectRegistered(extension.type, extension.version)
  ) {
    return;
  }
  if (
    extension.extensionType === "animation" &&
    isAnimationRegistered(extension.type)
  ) {
    return;
  }

  await addExtensionCode(extension.type, extension.version);

  registerExternalExtension(extension);
}

function registerExternalExtension(extension: IExtensionItem) {
  const scope = getGlobals();
  if (extension.extensionType === "object") {
    const key = extension.type + "-" + extension.version;
    const playerObj = scope.playerObjects?.[key];
    const appObj = scope.appObjects?.[key];

    registerExternalObject(appObj as any, playerObj as any);
    if (appObj) {
      logger.object.info(`Object '${appObj.type}' has been registered`);
    }
  } else if (extension.extensionType === "animation") {
    const playerObj = scope.playerAnimations?.[extension.type];
    const appObj = scope.appAnimations?.[extension.type];

    registerExternalAnimation(appObj as any, playerObj as any, true);
  }
}
