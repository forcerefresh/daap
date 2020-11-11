import React from "react";
import { connect } from "react-redux";
import { IStore } from "../../../store/store";

import css from "./SlideSettingsPanel.module.scss";

type ISlideSettingsPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    slideId: string;
  };

const SlidesPanel: React.FC<ISlideSettingsPanel> = (props) => {
  const { slideId } = props;

  return <div className={css.slideSettings}>{slideId}</div>;
};

const mapStateToProps = (state: IStore) => {
  const { slides } = state;
  return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
