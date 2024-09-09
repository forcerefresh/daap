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
  addNewSlide,
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
import { SlideType } from "../../store/reducers/i-slides";
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
import { PanelHeader } from "../common/panel-header/PanelHeader";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const SlidesPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    normalSlides,
    slideById,
    selectedSlideIds,
    activeSlideId,
    previewState,
    settings,
    loadSlideId,
    frontSlideId,
    backSlideId,
    selectionForProperties,
    _selectForProperties,
    _addNewSlide,
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
  const { getLicenseDetails } = globalContext.useLicenseHook();
  const [hasLicense, setHasLicense] = useState<boolean>(false);
  useEffect(() => {
    getLicenseDetails().then((data) => {
      if (data?.status === "OK" || data?.status === "EXPIRED") {
        setHasLicense(true);
      } else {
        setHasLicense(false);
      }
    });
  }, []);

  const dropLayersOnLoadHandler = (item: any, monitor: any) => {
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
    [loadSlideId]
  );

  const dropLayersOnFrontHandler = (item: any, monitor: any) => {
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
    [frontSlideId]
  );

  const dropLayersOnBackHandler = (item: any, monitor: any) => {
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
    [backSlideId]
  );

  const [showSettingsPanelForSlideId, setShowSettingsPanelForSlideId] =
    useState<string>(EmptyID);

  const onSlideClick = (
    event: React.MouseEvent<HTMLDivElement>,
    slideId: string
  ) => {
    if (event.shiftKey) {
      selectedSlideIds.indexOf(slideId) === -1
        ? _addSlidesToSelection([slideId])
        : _removeSlidesFromSelection([slideId]);
    } else {
      _activateSlide(slideId);
      _selectSlides([slideId]);
      _selectForProperties({ id: slideId, type: "slide" });
    }
  };

  // logic for handling click outside
  const ref = useRef(null);
  const handleClickOutside = () => {
    setShowSettingsPanelForSlideId(EmptyID);
  };
  useOnClickOutside(ref, handleClickOutside, "color-picker-holder");

  //
  const isSlideInPlay = (slideId: string) => {
    return (
      previewState.previewState === "play" &&
      previewState.scope?.entityType === "slide" &&
      previewState.scope?.entityId === slideId
    );
  };

  // render panels in Portal
  // const renderPanels = () => {
  //   return (
  //     <>
  //       <Portal className="bp5-dark">
  //         {showSettingsPanelForSlideId !== EmptyID && (
  //           <div ref={ref}>
  //             <SlideSettingsPanel slideId={showSettingsPanelForSlideId} />
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
          selectedSlideIds.forEach((slideId) => {
            _deleteSlideThree(slideId);
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
      <div className={css.panel}>
        <PanelHeader>
          <div>SLIDES</div>
          <div>
            <div
              ref={loadDropRef}
              className={cx(css.frontBackHolder, {
                [css.frontBackHolderDropOver]: isLayerOverLoad,
              })}
            >
              <Button
                small
                minimal
                active={activeSlideId === loadSlideId}
                onClick={() => {
                  _activateSlide(loadSlideId);
                  _selectSlides([loadSlideId]);
                  _selectForProperties({ id: loadSlideId, type: "slide" });
                }}
              >
                Load
              </Button>
            </div>
            <div
              ref={frontDropRef}
              className={cx(css.frontBackHolder, {
                [css.frontBackHolderDropOver]: isLayerOverFront,
              })}
            >
              <Button
                small
                minimal
                active={activeSlideId === frontSlideId}
                onClick={() => {
                  _activateSlide(frontSlideId);
                  _selectSlides([frontSlideId]);
                  _selectForProperties({ id: frontSlideId, type: "slide" });
                }}
              >
                Front
              </Button>
            </div>
            <div
              ref={backDropRef}
              className={cx(css.frontBackHolder, {
                [css.frontBackHolderDropOver]: isLayerOverBack,
              })}
            >
              <Button
                small
                minimal
                active={activeSlideId === backSlideId}
                onClick={() => {
                  _activateSlide(backSlideId);
                  _selectSlides([backSlideId]);
                  _selectForProperties({ id: backSlideId, type: "slide" });
                }}
              >
                Back
              </Button>
            </div>
          </div>
          <div>
            <Button
              minimal
              onClick={() => {
                if (!hasLicense && normalSlides.length >= 3) {
                  AppToaster.show({
                    intent: "warning",
                    message:
                      "You have reached the maximum number of slides in the FREE version.",
                  });
                } else {
                  _addNewSlide(SlideType.Normal, true);
                  scrollToBottomDelayed();
                }
              }}
              className={css.addNewSlide}
              small={true}
              icon="add"
            ></Button>
            <Popover2
              content={moreMenu}
              placement="left-end"
              shouldReturnFocusOnClose={false}
              interactionKind={Popover2InteractionKind.CLICK}
              hoverCloseDelay={100}
              hoverOpenDelay={150}
            >
              <Button
                minimal
                className={css.moreBtn}
                small={true}
                icon="more"
              ></Button>
            </Popover2>
          </div>
        </PanelHeader>
        <div className={css.slidesHolder} ref={slidesHolderRef}>
          {normalSlides.map((slideId: string, idx) => {
            const slide = slideById[slideId];
            const isLastSlide = idx === normalSlides.length - 1;
            return (
              <div key={slideId}>
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
                          dropItem.idsToMove
                        );
                      }}
                    />
                  )}
                <SlideRow
                  key={slide.id}
                  slide={slide}
                  activeSlideId={activeSlideId}
                  selectedSlideIds={selectedSlideIds}
                  onSlideClick={onSlideClick}
                  selectionForProperties={selectionForProperties}
                  inPlay={isSlideInPlay(slideId)}
                  realSlideDuration={getRealSlideDurationVisual(
                    slide,
                    settings
                  )}
                  realSlideExitDuration={getRealExitSlideDurationVis(
                    slide,
                    settings
                  )}
                  setStagePreview={_setStagePreview}
                  deleteSlideThree={(slideId: string) => {
                    _deleteSlideThree(slideId);
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
                        dropItem.idsToMove
                      );
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* {renderPanels()} */}
      </div>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, selection, settings } = state.project;
  const { previewState } = state.stage;

  // NOTE:  only one front and back slide
  const loadSlideId = slides.loadSlides[0];
  const frontSlideId = slides.frontSlides[0];
  const backSlideId = slides.backSlides[0];

  return {
    normalSlides: slides.normalSlides,
    slideById: slides.slideById,
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
  _addNewSlide: addNewSlide,
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
    moveIds: string[]
  ) => moveSlides(refId, where, moveIds),
  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveLayers(refId, where, moveIds),
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
