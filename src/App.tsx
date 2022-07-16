import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import "./App.scss";
import { IntegrationContext } from "./integration";
import { loadAndRegisterExternalComponent } from "./objects/external-object-utils";
import Editor from "./pages/editor/Editor";
import {
  initializeSlideAndLayer,
  updateGlobalConfiguration,
} from "./store/actions/actions";
import { IStore } from "./store/store";

import gsap from "gsap";

gsap.install(window);

type IAppProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>;

function App(props: IAppProps) {
  const { _initializeSlideAndLayer, _updateGlobalConfiguration } = props;

  const globalContext = useContext(IntegrationContext);

  const { getInstalledExtensions } = globalContext.useExtensionsHook();
  const { getSettings, scaleUI } = globalContext.useAppSettingsHook();

  useEffect(() => {
    // **
    _initializeSlideAndLayer();

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
  }, []);

  return (
    <div className="bp3-dark" style={{ height: "100%" }}>
      <Editor />
    </div>
  );
}

const mapStateToProps = (state: IStore) => {
  const { slides, selection } = state.project;
  return {
    allSlides: slides.allSlides,
    slideById: slides.slideById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
  };
};

const mapDispatchToProps = {
  _initializeSlideAndLayer: initializeSlideAndLayer,
  _updateGlobalConfiguration: updateGlobalConfiguration,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
