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
  addNewSlide,
  deleteSlideThree,
  selectSlides,
  activateSlide,
  addSlidesToSelection,
  removeSlidesFromSelection,
} from "../../store/actions/actions";

import css from "./SlidesPanel.module.scss";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const SlidesPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    allSlides,
    slideById,
    selectedSlideIds,
    activeSlideId,
    _addNewSlide,
    _deleteSlideThree,
    _activateSlide,
    _selectSlides,
    _addSlidesToSelection,
    _removeSlidesFromSelection,
  } = props;

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

  console.log(allSlides);
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
              {slideById[slideId].name}
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
  const { slides, selection } = state;
  return {
    allSlides: slides.allSlides,
    slideById: slides.slideById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
  };
};

const mapDispatchToProps = {
  _addNewSlide: () => addNewSlide(),
  _deleteSlideThree: (id: string): any => deleteSlideThree(id),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _addSlidesToSelection: addSlidesToSelection,
  _removeSlidesFromSelection: removeSlidesFromSelection,
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
