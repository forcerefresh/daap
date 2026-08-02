import React, { useEffect, useRef, useState, useContext } from "react";
import cx from "classnames";
import {
  Button,
  Colors,
  Menu,
  MenuDivider,
  MenuItem,
  Portal,
} from "@blueprintjs/core";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  addNewPage,
  deleteSlideThree,
  selectSlides,
  activateSlide,
  addSlidesToSelection,
  removeSlidesFromSelection,
  setStagePreview,
  selectForProperties,
  selectForPropertiesProps,
  moveSlides,
  duplicateSlides,
  moveLayers,
} from "../../store/actions/actions";
//import SlideSettingsPanel from "../slide-settings-panel/SlideSettingsPanel";

import css from "./SlidesPanel.module.scss";
import { EmptyID } from "../../store/types";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { IPreviewState } from "../../store/reducers/stage";
import { PageType } from "../../store/reducers/i-pages";
import {
  getRealExitSlideDurationVis,
  getRealSlideDurationVisual,
} from "../../utils/utils";
import { delay } from "lodash-es";
import { SlideRow } from "./SlideRow";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DropHandle, IDropItem } from "../layers-panel/DropHandle";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { IntegrationContext } from "../../integration";
import { PanelShell } from "../common/panel-shell/PanelShell";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const SlidesPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    pages,
    pageById,
    selectedSlideIds,
    activeSlideId,
    previewState,
    settings,
    loadSlideId,
    frontSlideId,
    backSlideId,
    selectionForProperties,
    _selectForProperties,
    _addNewPage,
    _deleteSlideThree,
    _activateSlide,
    _selectSlides,
    _addSlidesToSelection,
    _removeSlidesFromSelection,
    _setStagePreview,
    _moveSlides,
    _duplicatSlides,
    _moveLayers,
  } = props;

  const globalContext = useContext(IntegrationContext);
  // const { getLicenseDetails } = globalContext.useLicenseHook();
  const [hasLicense, _setHasLicense] = useState<boolean>(true);
  // useEffect(() => {
  //   getLicenseDetails().then((data) => {
  //     if (data?.status === "OK" || data?.status === "EXPIRED") {
  //       setHasLicense(true);
  //     } else {
  //       setHasLicense(false);
  //     }
  //   });
  // }, []);

  const dropLayersOnLoadHandler = (item: any, monitor: any) => {
    if (!loadSlideId) return; // TODO

    _moveLayers(loadSlideId, "slide", item.ids);
    _activateSlide(loadSlideId);
    _selectSlides([loadSlideId]);
    _selectForProperties({ id: loadSlideId, type: "slide" });
  };

  const [{ isOver: isLayerOverLoad }, loadDropRef] = useDrop<any, any, any>(
    () => ({
      accept: "layer",
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        item: monitor.getItem(),
      }),
      drop: dropLayersOnLoadHandler,
      // canDrop: (monitor: DropTargetMonitor): boolean => {
      //   return slide.layerIds.indexOf(item[0]) !== -1;
      // },
    }),
    [loadSlideId],
  );

  const dropLayersOnFrontHandler = (item: any, monitor: any) => {
    if (!frontSlideId) return; // TODO

    _moveLayers(frontSlideId, "slide", item.ids);
    _activateSlide(frontSlideId);
    _selectSlides([frontSlideId]);
    _selectForProperties({ id: frontSlideId, type: "slide" });
  };

  const [{ isOver: isLayerOverFront }, frontDropRef] = useDrop<any, any, any>(
    () => ({
      accept: "layer",
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        item: monitor.getItem(),
      }),
      drop: dropLayersOnFrontHandler,
      // canDrop: (monitor: DropTargetMonitor): boolean => {
      //   return slide.layerIds.indexOf(item[0]) !== -1;
      // },
    }),
    [frontSlideId],
  );

  const dropLayersOnBackHandler = (item: any, monitor: any) => {
    if (!backSlideId) return; // TODO

    _moveLayers(backSlideId, "slide", item.ids);
    _activateSlide(backSlideId);
    _selectSlides([backSlideId]);
    _selectForProperties({ id: backSlideId, type: "slide" });
  };

  const [{ isOver: isLayerOverBack }, backDropRef] = useDrop<any, any, any>(
    () => ({
      accept: "layer",
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        item: monitor.getItem(),
      }),
      drop: dropLayersOnBackHandler,
      // canDrop: (monitor: DropTargetMonitor): boolean => {
      //   return slide.layerIds.indexOf(item[0]) !== -1;
      // },
    }),
    [backSlideId],
  );

  const [showSettingsPanelForSlideId, setShowSettingsPanelForSlideId] =
    useState<string>(EmptyID);

  const onPageClick = (
    event: React.MouseEvent<HTMLDivElement>,
    pageId: string,
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

  // logic for handling click outside
  const ref = useRef(null);
  const handleClickOutside = () => {
    setShowSettingsPanelForSlideId(EmptyID);
  };
  useOnClickOutside(ref, handleClickOutside, "color-picker-holder");

  //
  const isSlideInPlay = (pageId: string) => {
    return (
      previewState.previewState === "play" &&
      previewState.scope?.entityType === "slide" &&
      previewState.scope?.entityId === pageId
    );
  };

  // render panels in Portal
  // const renderPanels = () => {
  //   return (
  //     <>
  //       <Portal className="bp5-dark">
  //         {showSettingsPanelForSlideId !== EmptyID && (
  //           <div ref={ref}>
  //             <SlideSettingsPanel pageId={showSettingsPanelForSlideId} />
  //           </div>
  //         )}
  //       </Portal>
  //     </>
  //   );
  // };

  const slidesHolderRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottomDelayed = () => {
    delay(() => {
      slidesHolderRef.current?.scrollTo({ top: 10000000 });
    }, 1);
  };

  // draging slides state
  const [isDraggingSlides, setIsDraggingSlides] = useState(false);
  const onDragingSlideChange = (isDragging: boolean) => {
    setIsDraggingSlides(isDragging);
  };

  const moreMenu = (
    <Menu>
      <MenuItem
        icon={"duplicate"}
        text="Duplicate selected"
        disabled={selectedSlideIds.length === 0}
        onClick={() => {
          _duplicatSlides(selectedSlideIds);
        }}
      />
      <MenuDivider />
      <MenuItem
        icon={"delete"}
        text="Delete selected"
        disabled={selectedSlideIds.length === 0}
        onClick={() => {
          selectedSlideIds.forEach((pageId) => {
            _deleteSlideThree(pageId);
          });
          AppToaster.show({
            intent: "warning",
            message:
              selectedSlideIds.length === 1
                ? "Page has been deleted."
                : "Multiple pages/slides has been deleted.",
          });
        }}
      />
    </Menu>
  );

  return (
    <>
      <PanelShell
        title="PAGES"
        bodyRef={slidesHolderRef}
        actions={
          <>
            <Button
              minimal
              onClick={() => {
                _addNewPage(PageType.Normal, true);
                scrollToBottomDelayed();
              }}
              className={css.addNewPage}
              small={true}
              icon="add"
            />
            <Popover2
              content={moreMenu}
              placement="left-end"
              shouldReturnFocusOnClose={false}
              interactionKind={Popover2InteractionKind.CLICK}
              hoverCloseDelay={100}
              hoverOpenDelay={150}
            >
              <Button minimal className={css.moreBtn} small={true} icon="more" />
            </Popover2>
          </>
        }
      >
        {pages.map((pageId: string, idx) => {
            const slide = pageById[pageId];
            const isLastSlide = idx === pages.length - 1;
            return (
              <div key={pageId}>
                {isDraggingSlides &&
                  selectedSlideIds.indexOf(slide.id) === -1 && (
                    <DropHandle
                      type={"slide"}
                      key={slide.id + "_drophandle"}
                      refId={slide.id}
                      where="above"
                      onDrop={(dropItem: IDropItem) => {
                        _moveSlides(
                          dropItem.id,
                          dropItem.where,
                          dropItem.idsToMove,
                        );
                      }}
                    />
                  )}
                <SlideRow
                  key={slide.id}
                  slide={slide}
                  activeSlideId={activeSlideId}
                  selectedSlideIds={selectedSlideIds}
                  onPageClick={onPageClick}
                  selectionForProperties={selectionForProperties}
                  inPlay={isSlideInPlay(pageId)}
                  realSlideDuration={getRealSlideDurationVisual(
                    slide,
                    settings,
                  )}
                  realSlideExitDuration={getRealExitSlideDurationVis(
                    slide,
                    settings,
                  )}
                  setStagePreview={_setStagePreview}
                  deleteSlideThree={(pageId: string) => {
                    _deleteSlideThree(pageId);
                    AppToaster.show({
                      intent: "warning",
                      message: "Page has been deleted.",
                    });
                  }}
                  onDragingChange={onDragingSlideChange}
                  _moveLayers={_moveLayers}
                />
                {isDraggingSlides && isLastSlide && (
                  <DropHandle
                    type={"slide"}
                    key={slide.id + "_drophandle_slide"}
                    refId={slide!.id}
                    where="bottom"
                    onDrop={(dropItem: IDropItem) => {
                      _moveSlides(
                        dropItem.id,
                        dropItem.where,
                        dropItem.idsToMove,
                      );
                    }}
                  />
                )}
              </div>
            );
          })}
      </PanelShell>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, selection, settings } = state.project;
  const { previewState } = state.stage;

  // NOTE:  only one front and back slide
  const loadSlideId = pages.loadPages?.[0];
  const frontSlideId = pages.frontPages?.[0];
  const backSlideId = pages.backPages?.[0];

  return {
    pages: pages.pages,
    pageById: pages.pageById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
    previewState,
    settings,
    loadSlideId,
    backSlideId,
    frontSlideId,
    selectionForProperties: selection.selectionForProperties,
  };
};

const mapDispatchToProps = {
  _addNewPage: addNewPage,
  _duplicatSlides: (ids: string[]): any => duplicateSlides(ids),
  _deleteSlideThree: (id: string): any => deleteSlideThree(id),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _addSlidesToSelection: addSlidesToSelection,
  _removeSlidesFromSelection: removeSlidesFromSelection,
  _setStagePreview: (preview: Partial<IPreviewState>) =>
    setStagePreview(preview),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _moveSlides: (
    refId: string,
    where: "above" | "bottom" | string,
    moveIds: string[],
  ) => moveSlides(refId, where, moveIds),
  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[],
  ) => moveLayers(refId, where, moveIds),
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
