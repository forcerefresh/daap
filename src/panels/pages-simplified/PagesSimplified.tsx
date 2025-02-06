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
  addNewPage,
  addSlidesToSelection,
  removeSlidesFromSelection,
  reorderPages,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import css from "./PagesSimplified.module.scss";
import { IPage, PageType } from "../../store/reducers/i-pages";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { SimplifiedObjectRow, SimplifiedPageRow } from "./SimplifiedPageRow";
import { cloneDeep, last } from "lodash-es";
import { Button, Text } from "@blueprintjs/core";
import withScrolling, {
  createVerticalStrength,
  useDndScrolling,
} from "react-dnd-scrolling";
import { object } from "yup";

const ScrollingComponent = withScrolling("div");

//import { DragLayerComponent } from "./CustomDragLayer";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const PagesSimplifiedPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    objects,
    activeObjectId,
    activeLayerId,
    breakpointConfig,
    selectedObjectIds,
    selectionPath,
    activeSlideId,
    selectionForProperties,
    selectedSlideIds,
    _addNewPage,
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
    _reorderPages,
    _addNewLayer,
    _addSlidesToSelection,
    _removeSlidesFromSelection,
    pagesIds,
    pageById,
  } = props;

  // useEffect(() => {
  //   const previewByPageId: { [key: string]: Blob } = {};
  //   pagesIds.forEach((pageId) => {
  //     //previewByPageId[pageId] = createPagePreview(pageById[pageId]);
  //   });
  // });

  const onPageClick = (
    event: React.MouseEvent<HTMLDivElement>,
    pageId: string
  ) => {
    if (event.shiftKey) {
      selectedSlideIds.indexOf(pageId) === -1
        ? _addSlidesToSelection([pageId])
        : _removeSlidesFromSelection([pageId]);
    } else {
      _activateSlide(pageId);
      _selectSlides([pageId]);
      _selectForProperties({ id: pageId, type: "slide" });
    }
  };

  const [forceUpdatePreviewIdx, setForceUpdatePreviewIdx] = useState(0);

  useEffect(() => {
    setForceUpdatePreviewIdx(forceUpdatePreviewIdx + 1);
  }, [objects]);
  // const objectIds = useMemo(() => {
  //   let objectIdsInternal: string[] = [];
  //   const firstSelectedObject = objectById[selectedObjectIds[0]];

  //   if (firstSelectedObject) {
  //     if (layerById[firstSelectedObject.parentId!]) {
  //       objectIdsInternal = layerById[firstSelectedObject.parentId!].objectIds;
  //     } else if (objectById[firstSelectedObject.id].parentId) {
  //       objectIdsInternal =
  //         objectById[objectById[firstSelectedObject.id].parentId!].objectIds!;
  //     }
  //   } else if (activeLayerId) {
  //     objectIdsInternal = layerById[activeLayerId].objectIds!;
  //   }
  //   return objectIdsInternal;
  // }, [objectById, layerById, selectedObjectIds]);

  const [sortedPageIds, setSortedPageIds] = useState<string[] | undefined>();

  //console.log(selectionPath, "selectionPath");

  useEffect(() => {
    setSortedPageIds(undefined);
  }, [pagesIds]);

  const movePage = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setSortedPageIds((prev) =>
        update(prev ?? pagesIds, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, (prev ?? pagesIds)[dragIndex] as string],
          ],
        })
      );
    },
    [pagesIds, setSortedPageIds]
  );

  // console.log(sortedObjectIds);
  // console.log(objectIds);

  // console.log(selectionPathWithoutLayer);
  // if (!parentLayerId) return null;

  console.log("LAYERS_S");

  console.log([...(sortedPageIds ?? [])]);
  console.log([...pagesIds]);

  return (
    <>
      <div className={cx(css.pagePanel, "no-custom-cursor")}>
        <>
          <div className={css.layersHolder}>
            {/* {layerArr?.map((layer, idx) => { */}
            {/* //if (!layer) return null; // TODO: IMPORTANT koo kopiranja slajda */}

            {/* return ( */}
            <>
              {/* <div style={{ display: "flex" }}>
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
                  {slide?.name}
                </Button>
              </div> */}

              {/* {layerArr?.length === 0 ? ( */}

              {/* ) : null} */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                {/* <Button small icon="caret-down" minimal></Button> */}
              </div>

              {/* key={layer.id} */}
              <ScrollingComponent className={cx(css.objectsHolder, {})}>
                {(sortedPageIds ?? pagesIds)?.length > 0 ? (
                  <>
                    {(sortedPageIds ?? pagesIds)?.map((pageId, idx) => {
                      const page = pageById[pageId];

                      return (
                        <div
                          className={css.itemHolder}
                          key={`object-${pageId}`}
                        >
                          {/* <SimplifiedObjectRow
                            moveObject={movePage}
                            dropCancel={() => {
                              setSortedObjectIds(undefined);
                            }}
                            dropDone={() => {
                              // const newLayer = cloneDeep(
                              //   layerById[parentLayerId]
                              // );
                              // if (sortedObjectIds)
                              //   newLayer.objectIds = sortedObjectIds;
                              // _updateLayer(newLayer);
                              // setSortedObjectIds(undefined);
                            }}
                            objectById={objectById}
                            onObjectClick={onObjectClick}
                            onObjectDblClick={onObjectDblClick}
                            breakpointConfig={breakpointConfig}
                            selectedObjectIds={selectedObjectIds}
                            object={object}
                            layer={layerById[activeLayerId!]} // todo
                            rowIndex={idx}
                          /> */}
                          <div
                            className={cx(css.objectItem, {
                              [css.selected]: page.id === activeObjectId,
                            })}
                          >
                            <div>{page.name}</div>
                            <div>
                              <Button
                                className={cx(
                                  css.smallButton,
                                  css.addPageSmall
                                )}
                                small
                                minimal
                                onClick={() => {
                                  _addNewPage(PageType.Normal, true, idx);
                                }}
                                icon="add"
                              ></Button>
                            </div>
                          </div>
                          <SimplifiedPageRow
                            forceUpdatePreviewIdx={forceUpdatePreviewIdx}
                            page={page}
                            movePage={movePage}
                            dropCancel={() => {
                              setSortedPageIds(undefined);
                            }}
                            dropDone={() => {
                              _reorderPages(sortedPageIds ?? pagesIds);

                              // _moveSlides(
                              //   dropItem.id,
                              //   dropItem.where,
                              //   dropItem.idsToMove
                              // );

                              // const newLayer = cloneDeep(
                              //   layerById[parentLayerId]
                              // );
                              // if (sortedObjectIds)
                              //   newLayer.objectIds = sortedObjectIds;
                              // _updateLayer(newLayer);
                              // setSortedObjectIds(undefined);
                            }}
                            pageById={pageById}
                            onPageClick={onPageClick}
                            breakpointConfig={breakpointConfig}
                            selectedPageIds={selectedSlideIds}
                            rowIndex={idx}
                          />
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <span className="bp5-text-disabled">No pages found</span>
                )}
              </ScrollingComponent>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  marginTop: "5px",
                  marginRight: "5px",
                }}
              >
                <Button
                  className={css.smallButton}
                  // intent={"primary"}
                  // minimal
                  small
                  minimal
                  onClick={() => {
                    _addNewPage(PageType.Normal, true);
                  }}
                  icon="add"
                >
                  Add Page
                </Button>
              </div>
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
  const { pages, selection, objects } = state.project;
  let activePage: IPage | null = null;

  if (selection.activeSlideId) {
    activePage = pages.pageById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    objects: objects.objectById,
    selectedSlideIds: selection.selectedSlideIds,
    pagesIds: pages.pages,
    pageById: pages.pageById,

    activePage,

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
  _deleteObjects: (objectIds: string[]): any => deleteObjects(objectIds),
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
  _addNewPage: addNewPage,
  _addSlidesToSelection: addSlidesToSelection,
  _removeSlidesFromSelection: removeSlidesFromSelection,
  _reorderPages: (pageIds: string[]) => reorderPages(pageIds),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PagesSimplifiedPanel);
