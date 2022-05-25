import { IMarketItem } from "./i-marketplace";
import { isObjectRegistered, registerExternalObject } from "./objects-factory";

export async function loadAndRegisterExternalComponent(
  marketItem: IMarketItem
) {
  if (isObjectRegistered(marketItem.type)) {
    console.warn(`Object ${marketItem.type} is already registered`);
    return;
  }
  const yp = await import(
    /* @ts-ignore */ /* webpackIgnore: true */ `${process.env.REACT_APP_MARKETPLACE_BASE_URL}/${marketItem.packageUrl}`
  );

  const obj = (window as any).WebSlider_GlogalScope.objects[marketItem.type];
  registerExternalObject(obj);
}
