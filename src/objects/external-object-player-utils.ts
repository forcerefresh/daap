import { registerExternalAnimation } from "webslider-sdk/lib/animations/animations-register";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { registerExternalObject } from "webslider-sdk/lib/objects/objects-register";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getGlobals } from "../globals";

export async function loadAndRegisterExternalComponentForPlayer(
  extension: IExtensionItem
) {
  const extensionFileName =
    extension.packageFiles.playerObjectFilename ||
    extension.packageFiles.playerAnimationFilename;

  const extensionUrl =
    extensionFileName?.startsWith("http:") ||
    extensionFileName?.startsWith("https:")
      ? extensionFileName
      : "./extensions/" + extensionFileName;

  try {
    // @vite-ignore and webpackIgnore needed for dynamic external URL imports
    await import(/* webpackIgnore: true */ /* @vite-ignore */ extensionUrl);
  } catch (_ex) {
    // silent — caller handles missing extensions gracefully
  }

  registerExternalExtensionForPlayer(extension);
}

function registerExternalExtensionForPlayer(extension: IExtensionItem) {
  const scope = getGlobals();
  if (extension.extensionType === "object") {
    const playerObj = scope.playerObjects?.[extension.type];

    registerExternalObject(undefined, playerObj);

    logger.object.info(`Object '${extension.type}' has been registered`);
  } else if (extension.extensionType === "animation") {
    const playerObj = scope.playerAnimations?.[extension.type];

    registerExternalAnimation(undefined, playerObj as any, true);

    logger.object.info(`Animation '${extension.type}' has been registered`);
  }
}
