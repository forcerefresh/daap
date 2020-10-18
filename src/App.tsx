import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  addNewSlide,
  deleteSlideDeep,
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
    dispatch(deleteSlideDeep(id));
  };

  const _addLayerToSelection = (layerId: string) => {
    dispatch(addLayersToSelection([layerId]));
  };

  console.log(slides.slideById);
  console.log(Object.values(slides.slideById));
  console.log();
  console.log();

  return (
    <div className="App bp3-dark">
      <SlidesPanel />
      <div style={{ marginLeft: "300px", marginRight: "300px" }}>
        <p>Slides:</p>
        {Object.values(slides.slideById).map((slide) => (
          <>
            <div
              className={cx("slide", {
                selected: selectedSlideIds.indexOf(slide.id) !== -1,
              })}
            >
              <div
                key={slide.id}
                className={cx({ active: activeSlideId === slide.id })}
              >
                {slide.name}
              </div>
              <button onClick={() => _deleteSlide(slide.id)}>X</button>
              <button onClick={() => _activateSlide(slide.id)}>Active</button>
              <button onClick={() => _selectSlide(slide.id)}>Select</button>
              <button onClick={() => _addSlideToSelection(slide.id)}>
                + Select
              </button>
              <button onClick={() => _removeSlideFromSelection(slide.id)}>
                - Select
              </button>
              <button onClick={() => _addLayer(slide.id)}>Add Layer</button>
            </div>

            {filtersLayers(layers, slide.id).map((layer) => (
              <div
                className={cx("layer", {
                  selected: selectedLayerIds.indexOf(layer.id) !== -1,
                })}
              >
                {layer.name}
                <button onClick={() => _addLayerToSelection(layer.id)}>
                  + Selection
                </button>
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

export default App;
