import React, { useContext, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./SettingsPanel.module.scss";
import {
  Button,
  Checkbox,
  FormGroup,
  HTMLSelect,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import {
  updateGlobalConfiguration,
  updateSlideDuration,
} from "../../store/actions/actions";
import { getCheckboxField, getNumericFiled } from "../../inputs/input-utils";
import { IAppSettings } from "../../store/reducers/globals";
import ProjectPanel from "../project-panel/ProjectPanel";
import { ObjectStorage } from "../object-storage/ObjectStorage";
import { IntegrationContext } from "../../integration";

enum GlobalPanelSections {
  UiLayout = "uiLayout",
  OtherSettings = "otherSettings",
  DeveloperSettings = "developerSettings",
}

interface ISettingsPanelProps {
  onRequestClose: () => void;
}

export type ISettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISettingsPanelProps;

const SettingsPanel: React.FC<ISettingsPanelMergedProps> = (props) => {
  const {
    globals,
    slideDuration,
    _updateSlideDuration,
    _updateGlobalConfiguration,
  } = props;

  const globalContext = useContext(IntegrationContext);
  const { supportStorageObjects } = globalContext.useObjectStorageHook();
  const { saveSettings, scaleUI } = globalContext.useAppSettingsHook();

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [GlobalPanelSections.UiLayout]: true,
    [GlobalPanelSections.OtherSettings]: true,
    [GlobalPanelSections.DeveloperSettings]: true,
  });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  const GlobalPanel: React.FunctionComponent = () => (
    <div>
      <section>
        <div
          className={css.sectionHeader}
          onClick={() => toggleSection(GlobalPanelSections.UiLayout)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.UiLayout]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          App layout
        </div>
        {visibleSectionIds[GlobalPanelSections.UiLayout] && (
          <div className={css.panel}>
            <FormGroup
              helperText="Choose app layout which make app easier for use, improves
              performance, specificity specificity of the projects."
              label="Layout type"
              labelFor="layoutType"
              //requiredLabel={true}
            >
              <RadioGroup
                name="layoutType"
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  const layoutType = e.currentTarget.value as any;

                  // save settings
                  saveSettings({
                    ...globals,
                    layoutType: layoutType,
                  });

                  //update store
                  _updateGlobalConfiguration({
                    layoutType,
                  } as Partial<IAppSettings>);
                }}
                selectedValue={globals.layoutType}
              >
                <Radio label="Default" value="default" />
                <Radio label="Extended layers" value="default-layers" />
              </RadioGroup>
            </FormGroup>
          </div>
        )}
      </section>
      <section>
        <div
          className={css.sectionHeader}
          onClick={() => toggleSection(GlobalPanelSections.OtherSettings)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.OtherSettings]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Other
        </div>
        {visibleSectionIds[GlobalPanelSections.OtherSettings] && (
          <div className={css.panel}>
            <FormGroup
              helperText={
                <>
                  Depend on the screen and resolution of your screen, choose
                  proper scale factor to get comfortable working experience.
                  <br />
                  NOTE: This option requires app restart (scale won't be applied
                  to all parts of app until app is restarted).
                </>
              }
              label="Scale"
              labelFor="appScale"
              //requiredLabel={true}
            >
              <HTMLSelect
                name="appScale"
                value={`${globals.appZoom}`}
                options={[
                  { value: "0.5", label: "50%" },
                  { value: "0.6", label: "60%" },
                  { value: "0.7", label: "70%" },
                  { value: "0.8", label: "80%" },
                  { value: "0.9", label: "90%" },
                  { value: "1", label: "100%" },
                  { value: "1.1", label: "110%" },
                  { value: "1.2", label: "120%" },
                  { value: "1.3", label: "130%" },
                  { value: "1.4", label: "140%" },
                  { value: "1.5", label: "150%" },
                ]}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const zoom = parseFloat(event.currentTarget.value);
                  // save settings
                  saveSettings({
                    ...globals,
                    appZoom: zoom,
                  });

                  //update store
                  _updateGlobalConfiguration({
                    appZoom: zoom,
                  });

                  // apply zoom to app
                  scaleUI(zoom).then();
                }}
              ></HTMLSelect>
            </FormGroup>
          </div>
        )}
      </section>

      <section>
        <div
          className={css.sectionHeader}
          onClick={() => toggleSection(GlobalPanelSections.DeveloperSettings)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.DeveloperSettings]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Developer
        </div>
        {visibleSectionIds[GlobalPanelSections.DeveloperSettings] && (
          <div className={css.panel}>
            <FormGroup
              labelFor="appScale"
              helperText="By enabling this you will get option to test your Object or Effect directly in app."
              //requiredLabel={true}
            >
              <div className="input60d">
                {getCheckboxField(
                  "Development mode",
                  globals.enableDeveloper,
                  (enableDeveloper: any) => {
                    // save settings
                    saveSettings({
                      ...globals,
                      enableDeveloper,
                    });

                    //update store
                    _updateGlobalConfiguration({
                      enableDeveloper,
                    });
                  }
                )}
              </div>
            </FormGroup>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className={cx("bp3-dark", css.settingsPanel)}>
      <div>
        <Tabs className={css.tabs}>
          <Tab id="project" title="Project Settings" panel={<ProjectPanel />} />
          <Tab id="global" title="App Settings" panel={<GlobalPanel />} />
          {supportStorageObjects && (
            <Tab
              id="objectStorage"
              title="Object Storage"
              panel={<ObjectStorage />}
            />
          )}

          {/*<Tabs.Expander />
          <Button minimal icon="cog" />*/}
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  slideDuration: state.project.settings.slideDuration,
  globals: state.globals,
});

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: string) => updateSlideDuration(newValue),
  _updateGlobalConfiguration: (globals: Partial<IAppSettings>) =>
    updateGlobalConfiguration(globals),
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
