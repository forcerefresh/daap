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
import "./SlidesPanel.scss";
import {
  addNewSlide,
  deleteSlideThree,
  selectSlides,
  activateSlide,
  addSlidesToSelection,
  removeSlidesFromSelection,
} from "../../store/actions/actions";

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

  console.log(allSlides);
  return (
    <div className="panel">
      <NavbarGroup>
        <Button
          onClick={() => _addNewSlide()}
          className={Classes.MINIMAL}
          icon="add"
          text="Add slide"
        />
      </NavbarGroup>
      <div className="slides-holder">
        {allSlides.map((slideId) => {
          return (
            <div
              onClick={() => {
                _activateSlide(slideId);
                _selectSlides([slideId]);
              }}
              className={cx(
                "slide",
                {
                  selected: selectedSlideIds.indexOf(slideId) !== -1,
                },
                { active: activeSlideId === slideId }
              )}
            >
              <Button
                minimal
                onClick={(event: any) => {
                  event.stopPropagation();
                  _deleteSlideThree(slideId);
                }}
                icon="delete"
              />
              {/*<Button minimal onClick={() => _selectSlides([slideId])} icon="selection"/>*/}
              <Button
                minimal
                onClick={(e: any) => {
                  e.stopPropagation();
                  _addSlidesToSelection([slideId]);
                }}
                icon="plus"
              />
              <Button
                minimal
                onClick={(e: any) => {
                  e.stopPropagation();
                  _removeSlidesFromSelection([slideId]);
                }}
                icon="minus"
              />
              {slideById[slideId].name}
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
