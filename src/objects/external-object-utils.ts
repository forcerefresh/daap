import { isEffectRegistered, registerEffect } from "../effects/effects";
import { addExtensionCode } from "../integration/utils/load-extension";
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
    const obj = (window as any).WebSlider_GlobalScope.objects[extension.type];
    logger.info(`Object '${obj.type}' has been registered`);
    registerExternalObject(obj);
  } else if (extension.componentType === "effect") {
    const eff = (window as any).WebSlider_GlobalScope.effects[extension.type];
    registerEffect(eff.definition, eff.defaults, eff.getDuration, true);
  } else {
    console.warn(
      `Unsuported external component type: ${extension.componentType}; name: ${extension.name}`
    );
  }
}
