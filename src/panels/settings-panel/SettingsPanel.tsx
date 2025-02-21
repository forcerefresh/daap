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
import AccountSettingsPanel from "../account-settings-panel/AccountSettingsPanel";
import AITextSettingsPanel from "../ai-settings-panel/AITextSettingsPanel";

interface ISettingsPanelProps {
  onRequestClose: () => void;
}

export type ISettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISettingsPanelProps & { defaultSelectedTabId?: string };

const SettingsPanel: React.FC<ISettingsPanelMergedProps> = ({
  defaultSelectedTabId = "project",
}) => {
  const globalContext = useContext(IntegrationContext);
  const { supportStorageObjects } = globalContext.useObjectStorageHook();
  //const { getLicenseDetails } = globalContext.useLicenseHook();

  // const [defaultSelectedTabId, setDefaultSelectedTabId] = useState("project");
  useEffect(() => {
    // getLicenseDetails().then((data) => {
    //   if (data?.status === "OK" || data?.status === "EXPIRED") {
    //     setDefaultSelectedTabId("project");
    //   } else {
    //     setDefaultSelectedTabId("license");
    //   }
    // });
    // setDefaultSelectedTabId();
  }, []);

  // if (!defaultSelectedTabId) {
  //   return null;
  // }

  return (
    <div className={cx("bp5-dark", css.settingsPanel)}>
      <div>
        <Tabs
          className={css.tabs}
          defaultSelectedTabId={defaultSelectedTabId}
          renderActiveTabPanelOnly={true}
        >
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
          <Tab id="account" title="Account" panel={<AccountSettingsPanel />} />
          <Tab
            id="ai"
            title="AI Text Assistant"
            panel={<AITextSettingsPanel />}
          />

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
