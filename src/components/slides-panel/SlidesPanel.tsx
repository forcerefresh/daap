import React, { Component } from "react";
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
import { addNewSlide } from "../../store/actions/actions";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const SlidesPanel: React.FC<ISlidesPanel> = (props) => {
  const { allSlides, slideById, addNewSlide } = props;

  console.log(allSlides);
  return (
    <div className="panel">
      <NavbarGroup>
        <Button
          onClick={() => addNewSlide()}
          className={Classes.MINIMAL}
          icon="add"
          text="Add slide"
        />
      </NavbarGroup>
      <div>
        {allSlides.map((slideId) => {
          return <div>{slideById[slideId].name}</div>;
        })}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides } = state;
  return { allSlides: slides.allSlides, slideById: slides.slideById };
};

const mapDispatchToProps = {
  addNewSlide: () => addNewSlide(),
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
