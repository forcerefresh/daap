import React, { Component } from "react";
import cx from "classnames";
import {
  Button,
  NavbarGroup,
  NavbarHeading,
  NavbarDivider,
  Classes,
} from "@blueprintjs/core";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  addNewLayer,
  addLayersToSelection,
  deleteLayers,
  activateLayer,
  selectLayers,
  addNewObject,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/layers";
import css from "./LayersPanel.module.scss";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LayersPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    layerArr,
    objectById,
    activeSlideId,
    activeLayerId,
    selectedLayerIds,
    _addNewLayer,
    _addLayersToSelection,
    _deleteLayers,
    _activateLayer,
    _selectLayers,
    _addNewObject,
  } = props;

  console.log(activeLayerId);
  return (
    <div className={css.layerPanel}>
      <NavbarGroup>
        <Button
          disabled={!activeSlideId}
          onClick={() => _addNewLayer(activeSlideId as string)}
          className={Classes.MINIMAL}
          icon="add"
          text="Add layer"
        />
      </NavbarGroup>
      <div className={css.slidesHolder}>
        {layerArr?.map((layer) => {
          return (
            <>
              <div
                onClick={() => {
                  _activateLayer(layer.id);
                  _selectLayers([layer.id]);
                }}
                className={cx(css.layer, {
                  [css.selected]: selectedLayerIds.indexOf(layer.id) !== -1,
                  [css.active]: activeLayerId === layer.id,
                })}
              >
                <Button
                  onClick={() => _addNewObject(layer.id, "text")}
                  className={Classes.MINIMAL}
                  icon="add"
                  text="Add object"
                />
                {layer.name}
              </div>
              {layer.objectIds.map((objectId) => {
                return <div>{objectById[objectId].type}</div>;
              })}
            </>
          );
        })}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection } = state;
  let layerArr: ILayer[] | null = null;

  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId) => layers.layerById[layerId]);
  }

  layers.allLayers.map((layerId: string) => {});
  return {
    layerArr,
    objectById: objects.objectById,
    activeSlideId: selection.activeSlideId,
    activeLayerId: selection.activeLayerId,
    selectedLayerIds: selection.selectedLayerIds,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (slideId: string) => addNewLayer(slideId),
  _addLayersToSelection: (layerIds: string[]) => addLayersToSelection(layerIds),
  _deleteLayers: (layerIds: string[]) => deleteLayers(layerIds),
  _activateLayer: (layerId: string) => activateLayer(layerId),
  _selectLayers: (layerIds: string[]) => selectLayers(layerIds),
  _addNewObject: (layerId: string, type: string) => addNewObject(layerId, type),
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersPanel);
