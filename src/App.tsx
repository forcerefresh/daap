import React, { useEffect } from "react";
import { connect } from "react-redux";
import "./App.scss";
import Editor from "./pages/editor/Editor";
import { addNewSlide, initializeSlideAndLayer } from "./store/actions/actions";
import { IStore } from "./store/store";

type IAppProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>;

function App(props: IAppProps) {
  useEffect(() => {
    props._initializeSlideAndLayer();
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
