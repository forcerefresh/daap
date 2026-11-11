import React from "react";
import { Menu, MenuItem } from "@blueprintjs/core";
import LinkOut from "../../assets/icons/link-out.svg?react";
import css from "./ToolbarPanel.module.scss";

type IHelpMenu = {
  appVersion?: string;
};

export const HelpMenu: React.FC<IHelpMenu> = (_props) => {
  return (
    <Menu className={css.helpMenu}>
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="Documentation"
        href="https://learn.daap.forcerefresh.io"
        target="_blank"
      />
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="Support Forum"
        href="https://support.forcerefresh.io"
        target="_blank"
      />
    </Menu>
  );
};
