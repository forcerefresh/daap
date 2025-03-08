import React from "react";
import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import LinkOut from "../../assets/icons/link-out.svg?react";
import css from "./ToolbarPanel.module.scss";

type IHelpMenu = {
  appVersion?: string;
};

export const HelpMenu: React.FC<IHelpMenu> = (props) => {
  const { appVersion } = props;

  return (
    <Menu className={css.helpMenu}>
      {/* <MenuDivider title={`WebSlider v${appVersion}`} /> */}
      {/* <MenuItem
        icon={<LinkOut style={{ opacity: 0, width: "15px", height: "19px" }} />}
        text="Documentation"
        onClick={() => {
          // TODO: this is only for Electron
          const { ipcRenderer } = window.require("electron");
          ipcRenderer.invoke("System::OpenDocs").then(() => {});
        }}
      /> */}
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="Live Documentation"
        onClick={() => {
          openExternalLink("https://docs.daap.forcerefresh.io/");
        }}
      />
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="Support Forum"
        onClick={() => {
          openExternalLink("https://support.forcerefresh.io");
        }}
      />
      <MenuDivider />
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="DAAP website"
        onClick={() => {
          openExternalLink("https://forcerefresh.io/");
        }}
      />
    </Menu>
  );
};

const openExternalLink = (url: string) => {
  const { shell } = window.require("electron");
  shell.openExternal(url);
};
