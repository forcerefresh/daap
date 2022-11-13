import React, { useContext, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { IntegrationContext } from "../../integration";
import { DevelopmentItem } from "../../panels/development-panel/i-development-types";
import { forceRefresh } from "../../store/actions/actions";
import { IStore, store } from "../../store/store";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
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
    //developmentItemsRef.current = [...developmentItems];
  }, [developmentItems]);

  const importAll = async () => {
    const devItems = developmentItemsRef.current;

    let hasUpdate = false;
    for (let i = 0; i < devItems.length; i++) {
      const devItem = devItems[i];

      if (!devItem.monitoringEnabled) return;

      // create url for hash.json
      const urlPathArr = devItems[i].appDevUrl.split("/");
      urlPathArr.pop();
      const hashUrl = urlPathArr.join("/") + "/hash.json";

      // load hash
      let hashJson = { hash: "" };
      try {
        hashJson = await (await fetch(hashUrl)).json();
      } catch (err: any) {
        logger.app.error(err);
        const devItemUpdate: Partial<DevelopmentItem> = {
          id: devItems[i].id,
          status: "ERROR",
          statusMessage: `Something went wrong. Development item ${
            devItems[i].appDevUrl
          } cannot be loaded. Additional info: ${err?.toString?.()}`,
        };
        await updateDevelopmentItem(devItemUpdate);

        return;
      }
      // compare hash
      if (hashsRef.current[devItem.type] === hashJson.hash) {
        continue;
      }

      logger.app.info(
        `Development Component (${devItem.type}) has been changed. Reloading...`
      );

      hashsRef.current = {
        ...hashsRef.current,
        [devItem.type]: hashJson.hash,
      };

      hasUpdate = true;

      try {
        await import(
          /* @ts-ignore */ /* webpackIgnore: true */ devItems[i].appDevUrl +
            "?" +
            Math.random()
        );
        await import(
          /* @ts-ignore */ /* webpackIgnore: true */ devItems[i].playerDevUrl +
            "?" +
            Math.random()
        );

        const devItemUpdate: Partial<DevelopmentItem> = {
          id: devItems[i].id,
          status: "OK",
          statusMessage: ``,
        };
        await updateDevelopmentItem(devItemUpdate);

        const global = (window as any).WebSlider_GlobalScope;

        if (devItem.componentType === "object") {
          global.registerExternalObject(
            {
              ...global.appObjects[devItems[i].type],
              development: true,
            },
            {
              ...global.playerObjects[devItems[i].type],
              development: true,
            },
            true
          );
        }

        if (devItem.componentType === "animation") {
          global.registerExternalAnimation(
            {
              ...global.appAnimations[devItems[i].type],
              development: true,
            },
            {
              ...global.playerAnimations[devItems[i].type],
              development: true,
            },
            true
          );
        }

        logger.app.info(
          `Development component (${devItem.componentType}:${devItems[i].type}) has been loaded.`
        );
      } catch (err: any) {
        logger.app.error(err);
        const devItemUpdate: Partial<DevelopmentItem> = {
          id: devItems[i].id,
          status: "ERROR",
          statusMessage: `Something went wrong. Development item ${
            devItems[i].appDevUrl
          } cannot be loaded. Additional info: ${err?.toString?.()}`,
        };
        await updateDevelopmentItem(devItemUpdate);
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
