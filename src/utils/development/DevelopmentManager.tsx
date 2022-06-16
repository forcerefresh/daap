import { isEqual } from "lodash-es";
import React, { useContext, useEffect, useRef } from "react";
import { IntegrationContext } from "../../integration";
import { DevelopmentItem } from "../../panels/development-panel/i-development-types";
import { forceRefresh } from "../../store/actions/actions";
import { store } from "../../store/store";
import { DevelopmentContext } from "./DevelopmentProvider";

export const DevelopmentManager = () => {
  const globalContext = useContext(IntegrationContext);
  const { getAll, updateDevelopmentItem } = globalContext.useDevelopmentHook();

  const { developmentItems } = useContext(DevelopmentContext);

  const developmentItemsRef = useRef<DevelopmentItem[]>(developmentItems);
  developmentItemsRef.current = [...developmentItems];

  //const currentStateRef = useRef<{ [key: string]: DevelopmentItem }>({});

  //useEffect(() => {
  //  devItems = developmentItems;
  //}, [developmentItems]);

  console.log(developmentItems);
  useEffect(() => {
    console.log("DEV getAll() - ONLY ONCE");
    getAll();
    restartDevelopmentInterval();
    return () => stopDevelopmentInterval();
  }, []);

  useEffect(() => {
    console.log("DEVELOPMENT ITEMS CHANGE EFFECT");
    //developmentItemsRef.current = [...developmentItems];
  }, [developmentItems]);

  const importAll = async () => {
    const devItems = developmentItemsRef.current;
    console.log("importAll");
    console.log(devItems);

    let hasUpdate = false;
    for (let i = 0; i < devItems.length; i++) {
      const devItem = devItems[i];

      console.log(devItem);
      if (!devItem.monitoringEnabled) return;
      console.log(devItem);

      /* if (
        isEqual(currentStateRef.current[devItem.id], devItem) &&
        devItem.status !== "ERROR"
      ) {
        console.log("EQUAL OR ERROR");
        return;
      }*/
      console.log(devItem);

      hasUpdate = true;

      try {
        await import(
          /* @ts-ignore */ /* webpackIgnore: true */ devItems[i].devUrl +
            "?" +
            Math.random()
        );
        const devItem: Partial<DevelopmentItem> = {
          id: devItems[i].id,
          status: "OK",
          statusMessage: ``,
        };
        await updateDevelopmentItem(devItem);

        const global = (window as any).WebSlider_GlobalScope;
        global.registerExternalObject(
          { ...global.objects[devItems[i].type], development: true },
          true
        );
      } catch (err: any) {
        console.error(err);
        const devItem: Partial<DevelopmentItem> = {
          id: devItems[i].id,
          status: "ERROR",
          statusMessage: `Something went wrong. Development item ${
            devItems[i].devUrl
          } cannot be loaded. Additional info: ${err?.toString?.()}`,
        };
        await updateDevelopmentItem(devItem);
      }
    }

    return hasUpdate;
  };

  const loadModulesInt = useRef<any>(-1);

  const restartDevelopmentInterval = () => {
    stopDevelopmentInterval();

    loadModulesInt.current = setInterval(async () => {
      const hasUpdate = await importAll();
      if (hasUpdate) store.dispatch(forceRefresh());
    }, 2000);
  };

  const stopDevelopmentInterval = () => {
    clearInterval(loadModulesInt.current);
  };

  return null;
};
