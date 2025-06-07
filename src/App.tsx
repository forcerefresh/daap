import React, { useContext, useEffect, useLayoutEffect } from "react";
import { connect } from "react-redux";
//import "./App.scss";
import "./AppNew.scss";
import { IntegrationContext } from "./integration";
import { loadAndRegisterExternalComponent } from "./objects/external-object-utils";
import Editor from "./pages/editor/Editor";
import {
  doClearHistory,
  initializeSlideAndLayer,
  loadUserData,
  setAIEnabled,
  setMyFonts,
  updateGlobalConfiguration,
} from "./store/actions/actions";
import { IStore } from "./store/store";

import gsap from "gsap";
import animejs from "animejs";
import { AppToaster } from "./utils/components/app-toaster/AppToaster";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import axios from "axios";

gsap.install(window);
(window as any).animejs = animejs;

type IAppProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & { className?: string };

function App(props: IAppProps) {
  const {
    _initializeSlideAndLayer,
    _updateGlobalConfiguration,
    _doClearHistory,
    _loadUserData,
    _setMyFonts,
    _setAIEnabled,
    theme,
    className,
  } = props;

  const globalContext = useContext(IntegrationContext);

  const { getInstalledExtensions } = globalContext.useExtensionsHook();
  // const { getSettings: getAppSettings, scaleUI } =
  //   globalContext.useAppSettingsHook();

  const { getSettings, scaleUI } = globalContext.useSettingsHook();

  const { fetchMedias } = globalContext.useMyMediaHook();

  const loadMyFonts = () => {
    fetchMedias({
      type: "font",
      tags: [],
      from: 1,
      perPage: 200,
    }).then(
      (result) => {
        _setMyFonts(result.data);
      },

      (error) => {
        logger.app.error(error);
      }
    );
  };

  useEffect(() => {
    // **
    _initializeSlideAndLayer();
    _doClearHistory();

    // **
    const loadExternalComponents = async () => {
      const installedExtensions = await getInstalledExtensions();

      for (let i = 0; i < installedExtensions.items.length; i++) {
        await loadAndRegisterExternalComponent(installedExtensions.items[i]);
      }
    };
    loadExternalComponents().then(() => {});

    //**
    // getAppSettings().then((settings) => {
    //   if (settings) {
    //     _updateGlobalConfiguration(settings);
    //     scaleUI(settings.appZoom);
    //   }
    // });

    _loadUserData();

    loadMyFonts();
  }, []);

  // disable pinch
  useEffect(() => {
    window.addEventListener(
      "wheel",
      (e) => {
        if ((e.target as Element).closest(".no-custom-cursor")) {
        } else if ((e.target as Element).closest(".layout-content-area")) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }, []);

  // global errors
  useEffect(() => {
    const globalErrorCallback = (event: Event) => {
      const customEvent = event as CustomEvent;
      AppToaster.show({
        intent: "warning",
        message: customEvent.detail.message,
      });
    };

    window.addEventListener("GLOBAL_ERROR", globalErrorCallback);
    return () =>
      window.removeEventListener("GLOBAL_ERROR", globalErrorCallback);
  }, []);

  useLayoutEffect(() => {
    document.body.className = `bp5-${theme}`;
  }, [theme]);

  // load ai info
  useEffect(() => {
    getSettings().then(function (response) {
      const textEnabled = (response.textAISettings ?? {}).enabled;
      _setAIEnabled([
        { enabled: textEnabled, objectType: "io.forcerefresh.text.object" },
      ]);

      if (response.appSettings) {
        _updateGlobalConfiguration(response.appSettings);
        scaleUI(response.appSettings.appZoom);
      } else {
        scaleUI(1);
      }
    });
  }, []);

  useEffect(() => {
    document.addEventListener("contextmenu", function (e) {
      if ((e.target as HTMLElement).closest(".daap-forcerefresh-app")) {
        e.preventDefault();
      }
    });
  }, []);

  return (
    <div className={`${className}`}>
      <Editor />
    </div>
  );
}

const mapStateToProps = (state: IStore) => {
  const { pages, selection } = state.project;
  return {
    pageById: pages.pageById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
    theme: state.globals.theme,
  };
};

const mapDispatchToProps = {
  _initializeSlideAndLayer: initializeSlideAndLayer,
  _updateGlobalConfiguration: updateGlobalConfiguration,
  _doClearHistory: () => doClearHistory(),
  _loadUserData: () => loadUserData(),
  _setMyFonts: (myFonts: SaaSMediaData[]) => setMyFonts(myFonts),
  _setAIEnabled: (payload: { objectType: string; enabled: boolean }[]) =>
    setAIEnabled(payload),
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
