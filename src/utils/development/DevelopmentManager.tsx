import { Console } from "console";
import { isEqual } from "lodash-es";
import React, { useContext, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { IntegrationContext } from "../../integration";
import { DevelopmentItem } from "../../panels/development-panel/i-development-types";
import { forceRefresh } from "../../store/actions/actions";
import { IStore, store } from "../../store/store";
import { DevelopmentContext } from "./DevelopmentProvider";

export type IDevelopmentManagerProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const DevelopmentManager = (props: IDevelopmentManagerProps) => {
  const { globals } = props;

  const globalContext = useContext(IntegrationContext);
  const { getAll, updateDevelopmentItem } = globalContext.useDevelopmentHook();

  const { developmentItems } = useContext(DevelopmentContext);

  const developmentItemsRef = useRef<DevelopmentItem[]>(developmentItems);
  developmentItemsRef.current = [...developmentItems];

  const hashsRef = useRef<{ [key: string]: string }>({});
  //hashsRef.current = {};

  useEffect(() => {
    if (globals.enableDeveloper) {
      getAll();
      restartDevelopmentInterval();
      return () => stopDevelopmentInterval();
    }
  }, [globals.enableDeveloper]);

  useEffect(() => {
    //console.log("DEVELOPMENT ITEMS CHANGE EFFECT");
    //developmentItemsRef.current = [...developmentItems];
  }, [developmentItems]);

  const importAll = async () => {
    const devItems = developmentItemsRef.current;

    let hasUpdate = false;
    for (let i = 0; i < devItems.length; i++) {
      const devItem = devItems[i];

      if (!devItem.monitoringEnabled) return;

      // create url for hash.json
      const urlPathArr = devItems[i].devUrl.split("/");
      urlPathArr.pop();
      const hashUrl = urlPathArr.join("/") + "/hash.json";

      // load hash
      let hashJson = { hash: "" };
      try {
        hashJson = await (await fetch(hashUrl)).json();
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

        return;
      }
      // compare hash
      if (hashsRef.current[devItem.type] === hashJson.hash) {
        continue;
      }

      console.log(
        `Development Component (${devItem.type}) has been changed. Reloading...`
      );

      hashsRef.current = {
        ...hashsRef.current,
        [devItem.type]: hashJson.hash,
      };

      hasUpdate = true;

      try {
        //console.log(devItems[i], "Load ");
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

        console.log(
          `Development Component (${devItems[i].type}) has been loaded.`
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

    const importAllPromise = async () => {
      const hasUpdate = await importAll();
      if (hasUpdate) store.dispatch(forceRefresh());
    };

    setTimeout(async () => {
      await importAllPromise();
    }, 500);

    loadModulesInt.current = setInterval(async () => {
      await importAllPromise();
    }, 2000);
  };

  const stopDevelopmentInterval = () => {
    clearInterval(loadModulesInt.current);
  };

  return null;
};

const mapStateToProps = (state: IStore) => ({
  globals: state.globals,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DevelopmentManager);
