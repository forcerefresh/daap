import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./SettingsPanel.module.scss";
import { Button, Tab, Tabs } from "@blueprintjs/core";
import ProjectPanel from "../project-settings-panel/ProjectSettingsPanel";
import { ObjectStorage } from "../object-storage/ObjectStorage";
import { IntegrationContext } from "../../integration";
import AppSettingsPanel from "../app-settings-panel/AppSettingsPanel";
import LicenseSettingsPanel from "../license-settings-panel/LicenseSettingsPanel";
import AccountSettingsPanel from "../account-settings-panel/AccountSettingsPanel";
import AITextSettingsPanel from "../ai-settings-panel/AITextSettingsPanel";
import DevelopmentPanel from "../development-panel/DevelopmentPanel";
import PublishSettingsPanel from "../publish-settings-panel/PublishSettingsPanel";

interface ISettingsPanelProps {
  onRequestClose: () => void;
}

export type ISettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISettingsPanelProps & { defaultSelectedTabId?: string };

const SettingsPanel: React.FC<ISettingsPanelMergedProps> = ({
  onRequestClose,
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
          {/* <Tab id="license" title="License" panel={<LicenseSettingsPanel />} /> */}
          {import.meta.env.VITE_APP_INTEGRATION === "saas" && (
            <Tab
              id="account"
              title="Account"
              panel={<AccountSettingsPanel />}
            />
          )}
          <Tab
            id="ai"
            title="AI Text Assistant"
            panel={<AITextSettingsPanel />}
          />

          <Tab
            id="development"
            title="Development"
            panel={<DevelopmentPanel />} //onRequestClose={props.onRequestClose}
          />

          <Tab
            id="publish-dev"
            title="Publish"
            panel={<PublishSettingsPanel />} //onRequestClose={props.onRequestClose}
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
