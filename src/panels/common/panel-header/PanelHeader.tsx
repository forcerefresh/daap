import React from "react";
import css from "./PanelHeader.module.scss";

type IPanelHeader = {};

export const PanelHeader: React.FC<IPanelHeader> = (props) => {
  const { children } = props;

  return <div className={css.panelHeader}>{children}</div>;
};
