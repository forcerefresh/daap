import React, { useRef, useState } from "react";
import cx from "classnames";
import { Button, Colors, Portal } from "@blueprintjs/core";
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
} from "../../store/actions/actions";
import SlideSettingsPanel from "../slide-settings-panel/SlideSettingsPanel";

import css from "./SlidesPanel.module.scss";
import { EmptyID } from "../../store/types";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { IPreviewState } from "../../store/reducers/stage";
import { SlideType } from "../../store/reducers/i-slides";
import { getRealSlideDurationVisual } from "../../utils/utils";
import { delay } from "lodash-es";
import { SlideRow } from "./SlideRow";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DropHandle, IDropItem } from "../layers-panel/DropHandle";

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
  } = props;

  const [showSettingsPanelForSlideId, setShowSettingsPanelForSlideId] =
    useState<string>(EmptyID);

  const onSlideClick = (
    event: React.MouseEvent<HTMLDivElement>,
    slideId: string
  ) => {
    if (event.ctrlKey) {
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
  const renderPanels = () => {
    return (
      <>
        <Portal className="bp3-dark">
          {showSettingsPanelForSlideId !== EmptyID && (
            <div ref={ref}>
              <SlideSettingsPanel slideId={showSettingsPanelForSlideId} />
            </div>
          )}
        </Portal>
      </>
    );
  };

  const slidesHolderRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottomDelayed = () => {
    delay(() => {
      slidesHolderRef.current?.scrollTo({ top: 10000000 });
      console.log("scrollTo");
    }, 1);
  };

  // draging slides state
  const [isDraggingSlides, setIsDraggingSlides] = useState(false);
  const onDragingSlideChange = (isDragging: boolean) => {
    setIsDraggingSlides(isDragging);
  };

  return (
    <>
      <div className={css.panel}>
        <div className={css.panelHeader}>
          <div>SLIDES</div>
          <div>
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
          <Button
            minimal
            onClick={() => {
              _addNewSlide(SlideType.Normal, true);
              scrollToBottomDelayed();
            }}
            className={css.addNewSlide}
            small={true}
            icon="add"
          ></Button>
        </div>
        <div className={css.slidesHolder} ref={slidesHolderRef}>
          {normalSlides.map((slideId: string, idx) => {
            const slide = slideById[slideId];
            const isLastSlide = idx === normalSlides.length - 1;
            return (
              <>
                {isDraggingSlides && selectedSlideIds.indexOf(slide.id) === -1 && (
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
                  setStagePreview={_setStagePreview}
                  deleteSlideThree={_deleteSlideThree}
                  onDragingChange={onDragingSlideChange}
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
              </>
            );
          })}
        </div>
        {renderPanels()}
      </div>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, selection, settings } = state.project;
  const { previewState } = state.stage;

  // NOTE:  only one front and back slide
  const frontSlideId = slides.frontSlides[0];
  const backSlideId = slides.backSlides[0];

  return {
    normalSlides: slides.normalSlides,
    slideById: slides.slideById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
    previewState,
    settings,
    backSlideId,
    frontSlideId,
    selectionForProperties: selection.selectionForProperties,
  };
};

const mapDispatchToProps = {
  _addNewSlide: addNewSlide,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
