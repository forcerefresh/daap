import { registerExternalAnimation } from "webslider-sdk/lib/animations/animations-register";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { registerExternalObject } from "webslider-sdk/lib/objects/objects-register";
import { createLogger } from "webslider-sdk/lib/utils/logger/logger";
const logger = createLogger();

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
  } else if (extension.componentType === "animation") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerAnimations[
      extension.type
    ];

    registerExternalAnimation(undefined, playerObj, true);

    logger.info(`Animation '${extension.type}' has been registered`);
  } else {
    console.warn(
      `Unsuported external component type: ${extension.componentType}; name: ${extension.name}`
    );
  }
}
