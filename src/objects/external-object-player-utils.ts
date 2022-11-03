import { registerExternalAnimation } from "../webslider-sdk/src/animations/animations-register";
import { IExtensionItem } from "../webslider-sdk/src/objects/i-extensions";
import { registerExternalObject } from "../webslider-sdk/src/objects/objects-register";
import { logger } from "../webslider-sdk/src/utils/logger/logger";

export async function loadAndRegisterExternalComponentForPlayer(
  extension: IExtensionItem
) {
  console.log(extension);
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
  console.log(extension);

  if (extension.componentType === "object") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerObjects[
      extension.type
    ];

    registerExternalObject(undefined, playerObj);

    logger.info(`Object '${extension.type}' has been registered`);
  } else if (extension.componentType === "effect") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerAnimations[
      extension.type
    ];

    registerExternalAnimation(undefined, playerObj, true);

    logger.info(`Effect '${extension.type}' has been registered`);
  } else {
    console.warn(
      `Unsuported external component type: ${extension.componentType}; name: ${extension.name}`
    );
  }
}
