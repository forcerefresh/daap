import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import update from "immutability-helper";
import {
  addNewLayer,
  addLayersToSelection,
  deleteLayersThree,
  activateLayer,
  selectLayers,
  addNewObject,
  activateObject,
  removeLayersFromSelection,
  deleteObjects,
  updateObject,
  selectObjects,
  addObjectsToSelection,
  removeObjectsFromSelection,
  deactivateObject,
  updateLayer,
  selectForProperties,
  selectForPropertiesProps,
  moveObjects,
  moveLayers,
  duplicateLayers,
  duplicateObjects,
  activateSlide,
  selectSlides,
  _updateObject,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import css from "./LayersSimplified.module.scss";
import { IPage } from "../../store/reducers/i-pages";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ObjectRow } from "./ObjectRow";
import { cloneDeep, last } from "lodash-es";
import { Button, Text } from "@blueprintjs/core";
import withScrolling, {
  createVerticalStrength,
  useDndScrolling,
} from "react-dnd-scrolling";

const ScrollingComponent = withScrolling("div");

//import { DragLayerComponent } from "./CustomDragLayer";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LayersSimplifiedPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    slide,
    layerArr,
    objectById,
    activeObjectId,
    activeLayerId,
    layerById,
    breakpointConfig,
    selectedObjectIds,
    selectionPath,
    activeSlideId,
    selectionForProperties,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    _activateLayer,
    _selectLayers,
    _activateSlide,
    _selectSlides,
    _updateLayer,
    _addNewLayer,
  } = props;

  // const objectsHolderRef = useRef<HTMLDivElement | null>(null);
  // // const linearVerticalStrength = createVerticalStrength(60);
  // useDndScrolling(objectsHolderRef, {
  //   // verticalStrength: linearVerticalStrength,
  // });

  // function ease(val) {
  //   const t = (val + 1) / 2; // [-1, 1] -> [0, 1]
  //   const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  //   return easedT * 2 - 1; // [0, 1] -> [-1, 1]
  // }

  // function hStrength(box, point) {
  //   return ease(linearHorizontalStrength(box, point));
  // }

  // function vStrength(box, point) {
  //   return ease(linearVerticalStrength(box, point));
  // }

  const onObjectClick = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => {
    if (event.shiftKey) {
      selectedObjectIds.indexOf(objectId) === -1
        ? _addObjectsToSelection([objectId])
        : _removeObjectsFromSelection([objectId]);
      if (activeObjectId === objectId) {
        _deactivateObject(objectId);
      }
    } else {
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
  };

  const onObjectDblClick = (
    event: React.MouseEvent<HTMLDivElement>,
    isGroup: boolean,
    objectId: string
  ) => {
    if (isGroup) {
      _activateObject(objectById[objectId]?.objectIds?.[0]!);
      _selectObjects(objectById[objectId]?.objectIds ?? []);
      //_selectForProperties({ type: "object", id: objectId });
    }
  };

  // let objectIds: string[] = [];

  // const firstSelectedObject = objectById[selectedObjectIds[0]];
  // if (firstSelectedObject) {
  //   if (layerById[firstSelectedObject.parentId!]) {
  //     objectIds = layerById[firstSelectedObject.parentId!].objectIds;
  //   } else if (objectById[firstSelectedObject.id].parentId) {
  //     objectIds =
  //       objectById[objectById[firstSelectedObject.id].parentId!].objectIds!;
  //   }
  // } else if (activeLayerId) {
  //   objectIds = layerById[activeLayerId].objectIds!;
  // }

  // const [objectIds, setObjectIds] = useState<string[]>([]);

  // useLayoutEffect(() => {
  //   let objectIds: string[] = [];

  //   const firstSelectedObject = objectById[selectedObjectIds[0]];
  //   if (firstSelectedObject) {
  //     if (layerById[firstSelectedObject.parentId!]) {
  //       objectIds = layerById[firstSelectedObject.parentId!].objectIds;
  //     } else if (objectById[firstSelectedObject.id].parentId) {
  //       objectIds =
  //         objectById[objectById[firstSelectedObject.id].parentId!].objectIds!;
  //     }
  //   } else if (activeLayerId) {
  //     objectIds = layerById[activeLayerId].objectIds!;
  //   }
  //   setObjectIds(objectIds);
  // }, [objectById, layerById, selectedObjectIds]);

  const objectIds = useMemo(() => {
    let objectIdsInternal: string[] = [];
    const firstSelectedObject = objectById[selectedObjectIds[0]];

    if (firstSelectedObject) {
      if (layerById[firstSelectedObject.parentId!]) {
        objectIdsInternal = layerById[firstSelectedObject.parentId!].objectIds;
      } else if (objectById[firstSelectedObject.id].parentId) {
        objectIdsInternal =
          objectById[objectById[firstSelectedObject.id].parentId!].objectIds!;
      }
    } else if (activeLayerId) {
      objectIdsInternal = layerById[activeLayerId].objectIds!;
    }
    return objectIdsInternal;
  }, [objectById, layerById, selectedObjectIds]);

  const [sortedObjectIds, setSortedObjectIds] = useState<
    string[] | undefined
  >();

  const [parentLayerIdFromSelection, ...selectionPathWithoutLayer] =
    selectionPath;
  const parentLayerId = parentLayerIdFromSelection ?? activeLayerId;

  const moveObject = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setSortedObjectIds((prev) =>
        update(prev ?? objectIds, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, (prev ?? objectIds)[dragIndex] as string],
          ],
        })
      );
    },
    [objectIds, setSortedObjectIds]
  );

  // if (!parentLayerId) return null;

  return (
    <>
      <div className={cx(css.layerPanel, "no-custom-cursor")}>
        <>
          <div className={css.layersHolder}>
            {/* {layerArr?.map((layer, idx) => { */}
            {/* //if (!layer) return null; // TODO: IMPORTANT koo kopiranja slajda */}

            {/* return ( */}
            <>
              <div style={{ display: "flex" }}>
                <Button
                  className={css.pageLabel}
                  intent={"primary"}
                  active={selectionForProperties?.id === slide?.id}
                  minimal
                  small
                  onClick={() => {
                    if (slide?.id) {
                      _activateSlide(slide.id);
                      _selectSlides([slide.id]);
                      _selectForProperties({ id: slide.id, type: "slide" });
                    }
                  }}
                >
                  {/* <span className={css.pageLabel}> */}
                  {slide?.name}
                  {/* </span> */}
                </Button>
                {/* <Button small icon="caret-down" minimal></Button> */}
              </div>

              {/* {layerArr?.length === 0 ? ( */}

              {/* ) : null} */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                {layerArr?.map((layer) => {
                  return (
                    <Button
                      key={layer.id}
                      className={css.smallButton}
                      intent={"primary"}
                      active={layer.id === activeLayerId}
                      minimal
                      small
                      onClick={() => {
                        _activateLayer(layer.id);
                        _selectLayers([layer.id]);
                        _selectForProperties({ type: "layer", id: layer.id });
                      }}
                    >
                      {layer.name}
                    </Button>
                  );
                })}

                {/* <Button small icon="caret-down" minimal></Button> */}
              </div>
              <div style={{ display: "flex", marginTop: "5px" }}>
                <Button
                  className={css.smallButton}
                  // intent={"primary"}
                  // minimal
                  disabled={!activeSlideId}
                  small
                  onClick={() => {
                    _addNewLayer(activeSlideId!);
                  }}
                  icon="add"
                >
                  Layer
                </Button>
              </div>

              {selectionPathWithoutLayer.map((pathObjectId) => (
                <div style={{ display: "flex" }}>
                  <Button
                    intent={"primary"}
                    minimal
                    small
                    onClick={() => {
                      _activateObject(pathObjectId);
                      _selectObjects([pathObjectId]);
                      _selectForProperties({
                        type: "object",
                        id: pathObjectId,
                      });
                    }}
                  >
                    {objectById[pathObjectId]?.name}
                  </Button>
                </div>
              ))}

              {/* key={layer.id} */}
              <ScrollingComponent className={cx(css.objectsHolder, {})}>
                {(sortedObjectIds ?? objectIds)?.length > 0 ? (
                  <>
                    {(sortedObjectIds ?? objectIds)?.map((objectId, idx) => {
                      const object = objectById[objectId];

                      return (
                        <React.Fragment key={`object-${objectId}`}>
                          <ObjectRow
                            moveObject={moveObject}
                            dropCancel={() => {
                              setSortedObjectIds(undefined);
                            }}
                            dropDone={() => {
                              const newLayer = cloneDeep(
                                layerById[parentLayerId]
                              );
                              if (sortedObjectIds)
                                newLayer.objectIds = sortedObjectIds;

                              _updateLayer(newLayer);

                              setSortedObjectIds(undefined);
                            }}
                            objectById={objectById}
                            onObjectClick={onObjectClick}
                            onObjectDblClick={onObjectDblClick}
                            breakpointConfig={breakpointConfig}
                            selectedObjectIds={selectedObjectIds}
                            object={object}
                            layer={layerById[activeLayerId!]} // todo
                            rowIndex={idx}
                          />
                          {/* <div
                            className={cx(css.objectItem, {
                              [css.selected]: object.id === activeObjectId,
                            })}
                          >
                            {object.name}
                          </div> */}
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  <span className="bp5-text-disabled">
                    No {layerArr?.length === 0 ? "layers" : "objects"} found
                  </span>
                )}
              </ScrollingComponent>
            </>
            {/* ); */}
            {/* })} */}
          </div>
        </>
      </div>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection } = state.project;
  //const { layoutType } = state.globals;
  let layerArr: ILayer[] | null = null;
  let slide: IPage | null = null;

  if (selection.activeSlideId) {
    const layerIds = pages.pageById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    slide = pages.pageById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    layerArr,
    slide,
    objectById: objects.objectById,
    layerById: layers.layerById,
    activeSlideId: selection.activeSlideId,
    activeLayerId: selection.activeLayerId,
    activeObjectId: selection.activeObjectId,
    selectedLayerIds: selection.selectedLayerIds,
    selectedObjectIds: selection.selectedObjectIds,
    selectionForProperties: selection.selectionForProperties,
    selectionPath: selection.selectionPath,
    selectedDevice: state.stage.selectedDevice,
    //layoutStaticAnimationsPanel: layoutType === "default-layers",
    breakpointsConfiguration: state.project.settings.breakpoints,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (pageId: string) => addNewLayer(pageId),
  _addLayersToSelection: (layerIds: string[]) => addLayersToSelection(layerIds),
  _removeLayersFromSelection: (layerIds: string[]) =>
    removeLayersFromSelection(layerIds),
  _deleteLayersThree: (layerIds: string[]): any => deleteLayersThree(layerIds),
  _activateLayer: (layerId: string) => activateLayer(layerId),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _selectLayers: (layerIds: string[]) => selectLayers(layerIds),
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>
  ) => addNewObject(layerId, type, objectProps),
  _activateObject: (objectId: string) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _moveObjects: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveObjects(refId, where, moveIds),

  _duplicateLayers: (ids: string[]): any => duplicateLayers(ids),
  _duplicateObjects: (ids: string[]): any => duplicateObjects(ids),
  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveLayers(refId, where, moveIds),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayersSimplifiedPanel);
