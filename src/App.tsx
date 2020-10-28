import React from "react";
import logo from "./logo.svg";
import "./App.scss";
import {
  addNewSlide,
  deleteSlideThree,
  addNewLayer,
  activateSlide,
  selectSlides,
  addSlidesToSelection,
  removeSlidesFromSelection,
  addLayersToSelection,
} from "./store/actions/actions";
import { IStore } from "./store/store";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import cx from "classnames";
import { ILayer } from "./store/reducers/layers";
import SlidesPanel from "./components/slides-panel/SlidesPanel";
import LayersPanel from "./components/layers-panel/LayersPanel";
import PropertiesPanel from "./components/properties-panel/PropertiesPanel";
import Preview from "./preview/Preview";
import TimelinePanel from "./components/timeline-panel/TimelinePanel";
import Editor from "./pages/editor/Editor";

function App() {
  const dispatch = useDispatch();
  const slides = useSelector((state: IStore) => state.slides);
  const activeSlideId = useSelector(
    (state: IStore) => state.selection.activeSlideId
  );
  const selectedSlideIds = useSelector(
    (state: IStore) => state.selection.selectedSlideIds
  );

  const selectedLayerIds = useSelector(
    (state: IStore) => state.selection.selectedLayerIds
  );

  const layers = useSelector((state: IStore) =>
    Object.values(state.layers.layerById)
  );

  const filtersLayers = (layers: ILayer[], slideId: string) => {
    return layers.filter((layer) => layer.slideId === slideId);
  };

  const _addLayer = (slideId: string) => {
    dispatch(addNewLayer(slideId));
  };
  const _activateSlide = (slideId: string) => {
    dispatch(activateSlide(slideId));
  };
  const _selectSlide = (slideId: string) => {
    dispatch(selectSlides([slideId]));
  };
  const _addSlideToSelection = (slideId: string) => {
    dispatch(addSlidesToSelection([slideId]));
  };
  const _removeSlideFromSelection = (slideId: string) => {
    dispatch(removeSlidesFromSelection([slideId]));
  };
  const _deleteSlide = (id: string) => {
    dispatch(deleteSlideThree(id));
  };

  const _addLayerToSelection = (layerId: string) => {
    dispatch(addLayersToSelection([layerId]));
  };

  console.log(slides.slideById);
  console.log(Object.values(slides.slideById));
  console.log();
  console.log();

  return (
    <div className="bp3-dark" style={{ height: "100%" }}>
      <Editor />
    </div>
  );
}

export default App;
