import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import "./App.scss";
import { IntegrationContext } from "./integration";
import { loadAndRegisterExternalComponent } from "./objects/external-object-utils";
import Editor from "./pages/editor/Editor";
import { addNewSlide, initializeSlideAndLayer } from "./store/actions/actions";
import { IStore } from "./store/store";

import gsap from "gsap";
gsap.install(window);

type IAppProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>;

function App(props: IAppProps) {
  const globalContext = useContext(IntegrationContext);

  const { getInstalledMarketItems } = globalContext.useMarketplaceHook();

  useEffect(() => {
    props._initializeSlideAndLayer();

    const loadExternalComponents = async () => {
      const installedMarketItems = await getInstalledMarketItems();
      console.log(installedMarketItems);
      for (let i = 0; i < installedMarketItems.items.length; i++) {
        await loadAndRegisterExternalComponent(installedMarketItems.items[i]);
      }
    };

    loadExternalComponents().then(() => {});
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
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
