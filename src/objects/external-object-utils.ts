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

export async function loadAndRegisterExternalComponent(
  extension: IExtensionItem
) {
  if (
    extension.componentType === "object" &&
    isObjectRegistered(extension.type)
  ) {
    console.warn(`Object ${extension.type} is already registered`);
    return;
  }
  if (
    extension.componentType === "animation" &&
    isAnimationRegistered(extension.type)
  ) {
    console.warn(`Animation ${extension.type} is already registered`);
    return;
  }

  await addExtensionCode(extension.type);

  registerExternalExtension(extension);
}

function registerExternalExtension(extension: IExtensionItem) {
  if (extension.componentType === "object") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerObjects[
      extension.type
    ];
    const appObj = (window as any).WebSlider_GlobalScope.appObjects[
      extension.type
    ];

    registerExternalObject(appObj, playerObj);
    logger.object.info(`Object '${appObj.type}' has been registered`);
  } else if (extension.componentType === "animation") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerAnimations[
      extension.type
    ];
    const appObj = (window as any).WebSlider_GlobalScope.appAnimations[
      extension.type
    ];

    registerExternalAnimation(appObj, playerObj, true);
  } else {
    console.warn(
      `Unsuported external component type: ${extension.componentType}; name: ${extension.name}`
    );
  }
}
