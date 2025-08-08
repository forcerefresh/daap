import { registerExternalAnimation } from "webslider-sdk/lib/animations/animations-register";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { registerExternalObject } from "webslider-sdk/lib/objects/objects-register";
import { logger } from "webslider-sdk/lib/utils/logger/logger";

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
    await import(
      /* @ts-ignore */
      /* webpackIgnore: true */
      /* @vite-ignore */
      extensionUrl
    );
  } catch (ex) {
    console.error(
      `Cannot load external component type: ${extension.extensionType}; version: ${extension.version}; name: ${extension.name}. Exception: ${ex}`
    );
  }

  registerExternalExtensionForPlayer(extension);
}

function registerExternalExtensionForPlayer(extension: IExtensionItem) {
  if (extension.extensionType === "object") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerObjects[
      extension.type
    ];

    registerExternalObject(undefined, playerObj);

    logger.object.info(`Object '${extension.type}' has been registered`);
  } else if (extension.extensionType === "animation") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerAnimations[
      extension.type
    ];

    registerExternalAnimation(undefined, playerObj, true);

    logger.object.info(`Animation '${extension.type}' has been registered`);
  } else {
    console.warn(
      `Unsuported external component type: ${extension.extensionType}; version: ${extension.version}; name: ${extension.name}`
    );
  }
}
