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
} from "../../store/actions/actions";
import SlideSettingsPanel from "../slide-settings-panel/SlideSettingsPanel";

import css from "./SlidesPanel.module.scss";
import { EmptyID } from "../../store/types";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { IPreviewState } from "../../store/reducers/stage";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const SlidesPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    allSlides,
    slideById,
    selectedSlideIds,
    activeSlideId,
    previewState,
    _addNewSlide,
    _deleteSlideThree,
    _activateSlide,
    _selectSlides,
    _addSlidesToSelection,
    _removeSlidesFromSelection,
    _setStagePreview,
  } = props;

  const [
    showSettingsPanelForSlideId,
    setShowSettingsPanelForSlideId,
  ] = useState<string>(EmptyID);

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
    }
  };

  // logic for handling click outside
  const ref = useRef(null);
  const handleClickOutside = () => {
    setShowSettingsPanelForSlideId(EmptyID);
  };
  useOnClickOutside(ref, handleClickOutside);

  return (
    <div className={css.panel}>
      <div className={css.panelHeader}>
        SLIDES PANEL
        <Button
          minimal
          onClick={() => _addNewSlide()}
          className={css.addNewSlide}
          small={true}
          icon="add"
        ></Button>
      </div>
      <div className={css.slidesHolder}>
        {allSlides.map((slideId) => {
          return (
            <div
              key={slideId}
              onClick={(event) => onSlideClick(event, slideId)}
              className={cx(
                css.slide,
                {
                  [css.selected]:
                    selectedSlideIds.length > 0 /*1*/ &&
                    selectedSlideIds.indexOf(slideId) !== -1,
                },
                {
                  [css.active]: activeSlideId === slideId,
                }
              )}
            >
              <div className={css.actionButtons}>
                <Button
                  minimal
                  active={
                    previewState.previewState === "play" &&
                    previewState.scope?.entityType === "slide" &&
                    previewState.scope?.entityId === slideId
                  }
                  onClick={() => {
                    if (
                      previewState.previewState === "play" &&
                      previewState.scope?.entityType === "slide" &&
                      previewState.scope?.entityId === slideId
                    ) {
                      _setStagePreview({
                        previewState: "stop",
                        isPreview: false,
                        scope: null,
                      });
                    } else {
                      _setStagePreview({
                        previewState: "play",
                        isPreview: true,
                        scope: {
                          entityType: "slide",
                          entityId: slideId,
                        },
                      });
                    }
                  }}
                  className={css.playButton}
                  small={true}
                  icon="play"
                ></Button>
                <Button
                  minimal
                  onClick={() => setShowSettingsPanelForSlideId(slideId)}
                  className={css.slideProperties}
                  small={true}
                  icon="cog"
                ></Button>
                <Portal>
                  {showSettingsPanelForSlideId !== EmptyID && (
                    <div ref={ref}>
                      <SlideSettingsPanel
                        slideId={showSettingsPanelForSlideId}
                      />
                    </div>
                  )}
                </Portal>
              </div>
              <div className={css.slideDescription}>
                {slideById[slideId].name}
              </div>
              <Button
                minimal
                onClick={(event: any) => {
                  event.stopPropagation();
                  _deleteSlideThree(slideId);
                }}
                className={css.deleteSlide}
                small={true}
                icon="delete"
              ></Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, selection } = state.project;
  const { previewState } = state.stage;
  return {
    allSlides: slides.allSlides,
    slideById: slides.slideById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
    previewState,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
