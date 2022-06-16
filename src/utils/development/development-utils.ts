import { DevelopmentItem } from "../../panels/development-panel/i-development-types";
import { forceRefresh, updateObject } from "../../store/actions/actions";
import { store } from "../../store/store";

const devItems: DevelopmentItem[] = [];

export function registerOrUpdateDevObject(devItem: DevelopmentItem) {
  const existIndex = devItems.findIndex((item) => item.type === devItem.type);
  if (existIndex >= 0) devItems[existIndex] = devItem;
  else devItems.push(devItem);

  restartDevelopmentInterval();
}

const importAll = async () => {
  for (let i = 0; i < devItems.length; i++) {
    try {
      await import(
        /* @ts-ignore */ /* webpackIgnore: true */ devItems[i].devUrl +
          "?" +
          Math.random()
      );
    } catch (err: any) {
      const obj: DevelopmentItem = {
        ...devItems[i],
        status: "ERROR",
        statusMessage: `Something went wrong. Development item ${
          devItems[i].devUrl
        } cannot be loaded or executed. Additional info: ${err?.toString?.()}`,
      };
      //update();
    }

    const global = (window as any).WebSlider_GlobalScope;
    global.registerExternalObject(global.objects[devItems[i].type], true);
  }
};

let loadModulesInt: any = -1;

export function restartDevelopmentInterval() {
  stopDevelopmentInterval();

  loadModulesInt = setInterval(() => {
    importAll();
    store.dispatch(forceRefresh());
  }, 2000);
}

export function stopDevelopmentInterval() {
  clearInterval(loadModulesInt);
}
