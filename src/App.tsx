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
  updateGlobalConfiguration,
} from "./store/actions/actions";
import { IStore } from "./store/store";

import gsap from "gsap";
import animejs from "animejs";
import { AppToaster } from "./utils/components/app-toaster/AppToaster";

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
    theme,
    className,
  } = props;

  const globalContext = useContext(IntegrationContext);

  const { getInstalledExtensions } = globalContext.useExtensionsHook();
  const { getSettings, scaleUI } = globalContext.useAppSettingsHook();

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
    getSettings().then((settings) => {
      if (settings) {
        _updateGlobalConfiguration(settings);
        scaleUI(settings.appZoom);
      }
    });

    _loadUserData();
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

  return (
    <div className={`${className}`}>
      <Editor />
    </div>
  );
}

const mapStateToProps = (state: IStore) => {
  const { slides, selection, settings } = state.project;
  return {
    allSlides: slides.allSlides,
    slideById: slides.slideById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
    theme: settings.theme,
  };
};

const mapDispatchToProps = {
  _initializeSlideAndLayer: initializeSlideAndLayer,
  _updateGlobalConfiguration: updateGlobalConfiguration,
  _doClearHistory: () => doClearHistory(),
  _loadUserData: () => loadUserData(),
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
