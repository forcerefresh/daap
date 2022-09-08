import { addExtensionCode } from "../integration/utils/load-extension";
import {
  isEffectRegistered,
  registerExternalEffect,
} from "../webslider-sdk/src/effects/effects-register";
import { IExtensionItem } from "../webslider-sdk/src/objects/i-extensions";
import {
  isObjectRegistered,
  registerExternalObject,
} from "../webslider-sdk/src/objects/objects-register";
import { logger } from "../webslider-sdk/src/utils/logger/logger";

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
    extension.componentType === "effect" &&
    isEffectRegistered(extension.type)
  ) {
    console.warn(`Effect ${extension.type} is already registered`);
    return;
  }

  await addExtensionCode(extension.type);

  //await import(
  //  /* @ts-ignore */ /* webpackIgnore: true */ `${process.env.REACT_APP_EXTENSIONS_BASE_URL}/${extension.packageUrl}`
  //);

  if (extension.componentType === "object") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerObjects[
      extension.type
    ];
    const appObj = (window as any).WebSlider_GlobalScope.appObjects[
      extension.type
    ];

    registerExternalObject(appObj, playerObj);
    logger.info(`Object '${appObj.type}' has been registered`);
  } else if (extension.componentType === "effect") {
    const playerObj = (window as any).WebSlider_GlobalScope.playerEffects[
      extension.type
    ];
    const appObj = (window as any).WebSlider_GlobalScope.playerEffects[
      extension.type
    ];

    registerExternalEffect(appObj, playerObj, true);
  } else {
    console.warn(
      `Unsuported external component type: ${extension.componentType}; name: ${extension.name}`
    );
  }
}
