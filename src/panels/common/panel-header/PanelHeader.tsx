import { PropsWithChildren } from "react";
import cx from "classnames";
import css from "./PanelHeader.module.scss";

type IPanelHeader = {
  title?: string;
  className?: string;
};

export const PanelHeader = (props: PropsWithChildren<IPanelHeader>) => {
  const { children, title, className } = props;

  return (
    <div className={cx(css.panelHeader, className)}>
      {title && <span className={css.title}>{title}</span>}
      {children}
    </div>
  );
};

export const RightPanelHeader = (props: PropsWithChildren<IPanelHeader>) => {
  const { children, title, className } = props;

  return (
    <div className={cx(css.panelHeader, css.rightPanelHeader, className)}>
      {title && <span className={css.title}>{title}</span>}
      {children}
    </div>
  );
};
