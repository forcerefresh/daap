import { isEffectRegistered, registerEffect } from "../effects/effects";
import { IMarketItem } from "../webslider-sdk/src/objects/i-marketplace";
import { isObjectRegistered, registerExternalObject } from "./objects-factory";

export async function loadAndRegisterExternalComponent(
  marketItem: IMarketItem
) {
  if (
    marketItem.componentType === "object" &&
    isObjectRegistered(marketItem.type)
  ) {
    console.warn(`Object ${marketItem.type} is already registered`);
    return;
  }
  if (
    marketItem.componentType === "effect" &&
    isEffectRegistered(marketItem.type)
  ) {
    console.warn(`Effect ${marketItem.type} is already registered`);
    return;
  }

  await import(
    /* @ts-ignore */ /* webpackIgnore: true */ `${process.env.REACT_APP_MARKETPLACE_BASE_URL}/${marketItem.packageUrl}`
  );

  if (marketItem.componentType === "object") {
    const obj = (window as any).WebSlider_GlobalScope.objects[marketItem.type];
    registerExternalObject(obj);
  } else if (marketItem.componentType === "effect") {
    const eff = (window as any).WebSlider_GlobalScope.effects[marketItem.type];
    registerEffect(eff.definition, eff.defaults, eff.getDuration, true);
  } else {
    console.warn(
      `Unsuported external component type: ${marketItem.componentType}; name: ${marketItem.name}`
    );
  }
}
