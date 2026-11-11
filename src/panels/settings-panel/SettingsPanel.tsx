import React, { useContext } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./SettingsPanel.module.scss";
import { Button, Tab, Tabs } from "@blueprintjs/core";
import ProjectPanel from "../project-settings-panel/ProjectSettingsPanel";
import { ObjectStorage } from "../object-storage/ObjectStorage";
import { IntegrationContext } from "../../integration";
import AppSettingsPanel from "../app-settings-panel/AppSettingsPanel";
import AccountSettingsPanel from "../account-settings-panel/AccountSettingsPanel";
import DevelopmentPanel from "../development-panel/DevelopmentPanel";

interface ISettingsPanelProps {
  onRequestClose: () => void;
}

export type ISettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISettingsPanelProps & { defaultSelectedTabId?: string };

const SettingsPanel: React.FC<ISettingsPanelMergedProps> = ({
  onRequestClose,
  defaultSelectedTabId = "project",
  globals,
}) => {
  const globalContext = useContext(IntegrationContext);
  const { supportStorageObjects } = globalContext.useObjectStorageHook();
  const { platform } = globalContext;
  return (
    <div className={cx("bp5-dark", css.settingsPanel)}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      <div style={{ display: "flex", height: "100%" }}>
        <Tabs
          className={css.tabs}
          defaultSelectedTabId={defaultSelectedTabId}
          renderActiveTabPanelOnly={true}
        >
          <Tab
            id="project"
            title="Document Settings"
            panel={<ProjectPanel />}
          />
          <Tab id="global" title="App Settings" panel={<AppSettingsPanel />} />
          {supportStorageObjects && (
            <Tab
              id="objectStorage"
              title="Object Storage"
              panel={<ObjectStorage />}
            />
          )}
          {platform.hasAccountUI && (
            <Tab
              id="account"
              title="Account"
              panel={<AccountSettingsPanel />}
            />
          )}

          {platform.hasAccountUI &&
            globals.publishSettings?.enabled && (
              <Tab
                id="development"
                title="Development"
                panel={<DevelopmentPanel onRequestClose={() => {}} />}
              />
            )}


        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { globals } = state;

  return { globals };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
