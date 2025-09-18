import React, { PropsWithChildren } from "react";
import cx from "classnames";
import css from "./PanelHeader.module.scss";

type IPanelHeader = {
  className?: string;
};

export const PanelHeader = (props: PropsWithChildren<IPanelHeader>) => {
  const { children, className } = props;

  return <div className={cx(css.panelHeader, className)}>{children}</div>;
};

export const RightPanelHeader = (props: PropsWithChildren<IPanelHeader>) => {
  const { children, className } = props;

  return (
    <div className={cx(css.panelHeader, css.rightPanelHeader, className)}>
      {children}
    </div>
  );
};
