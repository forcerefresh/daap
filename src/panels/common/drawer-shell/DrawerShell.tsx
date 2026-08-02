import React, { PropsWithChildren } from "react";
import cx from "classnames";
import { RightPanelHeader } from "../panel-header/PanelHeader";
import css from "./DrawerShell.module.scss";

type DrawerShellProps = {
  title: string;
  statusSlot?: React.ReactNode;
  className?: string;
};

export const DrawerShell = (props: PropsWithChildren<DrawerShellProps>) => {
  const { title, statusSlot, children, className } = props;

  return (
    <div className={cx("bp5-dark", css.drawer, className)}>
      <RightPanelHeader title={title}>
        {statusSlot}
      </RightPanelHeader>
      {children}
    </div>
  );
};
