import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./SettingsPanel.module.scss";
import { Tab, Tabs } from "@blueprintjs/core";
import ProjectPanel from "../project-settings-panel/ProjectSettingsPanel";
import { ObjectStorage } from "../object-storage/ObjectStorage";
import { IntegrationContext } from "../../integration";
import AppSettingsPanel from "../app-settings-panel/AppSettingsPanel";
import LicenseSettingsPanel from "../license-settings-panel/LicenseSettingsPanel";

interface ISettingsPanelProps {
  onRequestClose: () => void;
}

export type ISettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISettingsPanelProps;

const SettingsPanel: React.FC<ISettingsPanelMergedProps> = (props) => {
  const globalContext = useContext(IntegrationContext);
  const { supportStorageObjects } = globalContext.useObjectStorageHook();
  const { getLicenseDetails } = globalContext.useLicenseHook();

  const [defaultSelectedTabId, setDefaultSelectedTabId] = useState("");
  useEffect(() => {
    getLicenseDetails().then((data) => {
      if (data?.status === "OK" || data?.status === "EXPIRED") {
        setDefaultSelectedTabId("project");
      } else {
        setDefaultSelectedTabId("license");
      }
    });
  }, []);

  if (!defaultSelectedTabId) {
    return null;
  }
  return (
    <div className={cx("bp3-dark", css.settingsPanel)}>
      <div>
        <Tabs className={css.tabs} defaultSelectedTabId={defaultSelectedTabId}>
          <Tab id="project" title="Project Settings" panel={<ProjectPanel />} />
          <Tab id="global" title="App Settings" panel={<AppSettingsPanel />} />
          {supportStorageObjects && (
            <Tab
              id="objectStorage"
              title="Object Storage"
              panel={<ObjectStorage />}
            />
          )}
          <Tab id="license" title="License" panel={<LicenseSettingsPanel />} />

          {/*<Tabs.Expander />
          <Button minimal icon="cog" />*/}
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
