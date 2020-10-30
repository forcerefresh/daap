import React, { Component, useEffect, useState } from "react";
import cx from "classnames";
import {
  Button,
  NavbarGroup,
  NavbarHeading,
  NavbarDivider,
  Classes,
  Icon,
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
  activateObject,
  removeLayersFromSelection,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/layers";
import css from "./LayersPanel.module.scss";
import { ISlide } from "../../store/reducers/slides";
import { isEmpty } from "lodash-es";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LayersPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    layerArr,
    slide,
    objectById,
    activeSlideId,
    activeLayerId,
    activeObjectId,
    selectedLayerIds,
    _addNewLayer,
    _addLayersToSelection,
    _removeLayersFromSelection,
    _deleteLayers,
    _activateLayer,
    _selectLayers,
    _addNewObject,
    _activateObject,
  } = props;

  const [openLayerById, setOpenLayerById] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (activeLayerId && isEmpty(openLayerById)) {
      setOpenLayerById({ [activeLayerId]: true });
    }
  }, [activeLayerId]);

  const toggleLayer = (layerId: string) => {
    setOpenLayerById({
      ...openLayerById,
      [layerId]: !openLayerById[layerId],
    });
  };

  const onLayerClick = (
    event: React.MouseEvent<HTMLDivElement>,
    layerId: string
  ) => {
    if (event.ctrlKey) {
      selectedLayerIds.indexOf(layerId) === -1
        ? _addLayersToSelection([layerId])
        : _removeLayersFromSelection([layerId]);
    } else {
      _activateLayer(layerId);
      _selectLayers([layerId]);
    }
  };

  return (
    <div className={css.layerPanel}>
      <div className={css.panelHeader}>
        <div>
          LAYERS PANEL
          <span className={css.slideName}>
            {slide && " [ " + slide.name + " ] "}
          </span>
        </div>
        <div>
          <Button
            minimal
            disabled={!activeSlideId}
            onClick={() => _addNewLayer(activeSlideId as string)}
            className={css.addNewLayer}
            small={true}
            icon="add"
          ></Button>
        </div>
      </div>
      <div className={css.layersHolder}>
        {layerArr?.map((layer) => {
          return (
            <div
              className={cx(css.layer, {
                [css.selected]:
                  selectedLayerIds.length > 0 /*1*/ &&
                  selectedLayerIds.indexOf(layer.id) !== -1,
              })}
            >
              <div
                key={layer?.id}
                onClick={(event) => onLayerClick(event, layer.id)}
                className={cx(css.layerInner, {
                  [css.active]: activeLayerId === layer.id,
                })}
              >
                <div>
                  <Button
                    minimal
                    onClick={(event: any) => {
                      event.stopPropagation();
                      toggleLayer(layer.id);
                    }}
                    className={cx(css.layerToggle, {
                      [css.layerOpen]: openLayerById[layer.id],
                    })}
                    small={true}
                    icon="play"
                  ></Button>

                  <div className={css.layerName}>{layer.name}</div>

                  <div className={css.objectCount}>
                    (objects: {layer.objectIds.length})
                  </div>
                </div>
                <div>
                  <Button
                    minimal
                    onClick={(event: any) => {
                      event.stopPropagation();
                      _deleteLayers([layer.id]);
                    }}
                    className={css.deleteLayer}
                    small={true}
                    icon="delete"
                  ></Button>
                </div>
              </div>
              {openLayerById[layer.id] && (
                <>
                  {layer.objectIds.map((objectId) => {
                    return (
                      <div
                        onClick={() => _activateObject(objectId)}
                        className={cx(css.objectHolder, {
                          [css.active]: activeObjectId === objectId,
                        })}
                      >
                        {objectById[objectId].type}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection } = state;
  let layerArr: ILayer[] | null = null;
  let slide: ISlide | null = null;

  console.log({ ...selection });
  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId) => layers.layerById[layerId]);
    slide = slides.slideById[selection.activeSlideId];
  }

  // layers.allLayers.map((layerId: string) => {});
  return {
    layerArr,
    slide,
    objectById: objects.objectById,
    activeSlideId: selection.activeSlideId,
    activeLayerId: selection.activeLayerId,
    activeObjectId: selection.activeObjectId,
    selectedLayerIds: selection.selectedLayerIds,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (slideId: string) => addNewLayer(slideId),
  _addLayersToSelection: (layerIds: string[]) => addLayersToSelection(layerIds),
  _removeLayersFromSelection: (layerIds: string[]) =>
    removeLayersFromSelection(layerIds),
  _deleteLayers: (layerIds: string[]) => deleteLayers(layerIds),
  _activateLayer: (layerId: string) => activateLayer(layerId),
  _selectLayers: (layerIds: string[]) => selectLayers(layerIds),
  _addNewObject: (layerId: string, type: string) => addNewObject(layerId, type),
  _activateObject: (objectId: string) => activateObject(objectId),
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersPanel);
