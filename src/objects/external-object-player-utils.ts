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

  try {
    await import(
      /* @ts-ignore */ /* webpackIgnore: true */ "../extensions/" +
        extensionFileName
    );
  } catch (ex) {
    console.error(
      `Cannot load external component type: ${extension.componentType}; name: ${extension.name}. Exception: ${ex}`
    );
  }

  registerExternalExtensionForPlayer(extension);
}

function registerExternalExtensionForPlayer(extension: IExtensionItem) {
  if (extension.componentType === "object") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerObjects[
      extension.type
    ];

    registerExternalObject(undefined, playerObj);

    logger.object.info(`Object '${extension.type}' has been registered`);
  } else if (extension.componentType === "animation") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerAnimations[
      extension.type
    ];

    registerExternalAnimation(undefined, playerObj, true);

    logger.object.info(`Animation '${extension.type}' has been registered`);
  } else {
    console.warn(
      `Unsuported external component type: ${extension.componentType}; name: ${extension.name}`
    );
  }
}
