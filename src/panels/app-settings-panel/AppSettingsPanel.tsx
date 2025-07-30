import React, { useState, useContext, SyntheticEvent } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AppSettingsPanel.module.scss";
import {
  Button,
  FormGroup,
  HTMLSelect,
  Radio,
  RadioGroup,
  Switch,
} from "@blueprintjs/core";
import {
  updateGlobalConfiguration,
  updateSlideDuration,
} from "../../store/actions/actions";
import {
  getCheckboxField,
  getColorField,
  getSelectField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";

import { IAppSettings } from "../../store/reducers/globals";
import { IntegrationContext } from "../../integration";

enum GlobalPanelSections {
  Editor = "editor",
  UiLayout = "uiLayout",
  OtherSettings = "otherSettings",
  DeveloperSettings = "developerSettings",
}

export type IAppSettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const AppSettingsPanel: React.FC<IAppSettingsPanelMergedProps> = (props) => {
  const { globals, _updateGlobalConfiguration } = props;

  const globalContext = useContext(IntegrationContext);
  const { patchSettings, scaleUI } = globalContext.useSettingsHook();

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [GlobalPanelSections.Editor]: true,
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

  return (
    <div className={css.appSettingsPanel}>
      <section>
        <div
          className={css.sectionHeader}
          onClick={() => toggleSection(GlobalPanelSections.Editor)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.Editor]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Editor
        </div>
        {visibleSectionIds[GlobalPanelSections.UiLayout] && (
          <div className={css.panel}>
            <div className="input60">
              {getCheckboxField(
                "Snap to Object",
                globals.snapToObject,
                (snapToObject: any) => {
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      snapToObject,
                    },
                  });

                  //update store
                  _updateGlobalConfiguration({
                    snapToObject,
                  });
                }
              )}
            </div>

            <div className="input60">
              {getSelectField(
                "Snap to Object threshold",
                globals.snapToObjectThreshold,
                Array(10)
                  .fill({})
                  .map((_, idx) => ({
                    value: idx + 1,
                    label: idx + 1 + "px",
                  })),
                (snapToObjectThreshold) => {
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      snapToObjectThreshold: snapToObjectThreshold,
                    },
                  });

                  //update store
                  _updateGlobalConfiguration({
                    snapToObjectThreshold: snapToObjectThreshold,
                  });
                },
                { disabled: !globals.snapToObject }
              )}
            </div>

            <div className="input60">
              {getCheckboxField(
                "Snap to Object",
                globals.snapToMargin,
                (snapToMargin: any) => {
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      snapToMargin,
                    },
                  });

                  //update store
                  _updateGlobalConfiguration({
                    snapToMargin,
                  });
                }
              )}
            </div>

            <div className="input60">
              {getSelectField(
                "Snap to Object threshold",
                globals.snapToMarginThreshold,
                Array(10)
                  .fill({})
                  .map((_, idx) => ({
                    value: idx + 1,
                    label: idx + 1 + "px",
                  })),
                (snapToMarginThreshold) => {
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      snapToMarginThreshold: snapToMarginThreshold,
                    },
                  });

                  //update store
                  _updateGlobalConfiguration({
                    snapToObjectThreshold: snapToMarginThreshold,
                  });
                },
                { disabled: !globals.snapToObject }
              )}
            </div>

            <div className="input60">
              {getColorField(
                "Outline color",
                globals.outlineColor,
                (outlineColor: any) => {
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      outlineColor,
                    },
                  });

                  //update store
                  _updateGlobalConfiguration({
                    outlineColor,
                  });
                },
                ""
              )}
            </div>
          </div>
        )}
      </section>

      {/* <section>
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
                  patchSettings({
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
      </section> */}
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
          General
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
                  patchSettings({
                    appSettings: {
                      ...globals,
                      appZoom: zoom,
                    },
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

            {/* <FormGroup
              label="Theme"
              labelFor="theme"
              //requiredLabel={true}
            >
              <Switch
                name="theme"
                // style={{ margin: "2px" }}
                checked={globals.theme === "dark"}
                onChange={(evt: SyntheticEvent<HTMLInputElement>) => {
                  const theme = evt.currentTarget.checked ? "dark" : "light";
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      theme: theme,
                    },
                  });

                  _updateGlobalConfiguration({
                    theme,
                  });

                  // _setTheme(theme);
                }}
              />
            </FormGroup> */}
          </div>
        )}
      </section>
      {/* 
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
              helperText={
                <>
                  By enabling this you will get option to test your Object or
                  Animation directly in app.
                  <br />
                  <span style={{ color: "yellow" }}>
                    It's recommended to restart app if you change Development
                    mode.
                  </span>
                </>
              }
              //requiredLabel={true}
            >
              <div className="input60d">
                {getCheckboxField(
                  "Development mode",
                  globals.enableDeveloper,
                  (enableDeveloper: any) => {
                    // save settings
                    patchSettings({
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

              {globals.enableDeveloper && (
                <>
                  <div className="input60d">
                    {getCheckboxField(
                      "Allow prerelease installation",
                      globals.allowPrerelease,
                      (allowPrerelease: any) => {
                        // save settings
                        patchSettings({
                          ...globals,
                          allowPrerelease,
                        });

                        //update store
                        _updateGlobalConfiguration({
                          allowPrerelease,
                        });
                      }
                    )}
                  </div>
                  <div className="input60d">
                    {getCheckboxField(
                      "Developer Tools",
                      globals.devTools,
                      (devTools: any) => {
                        // save settings
                        patchSettings({
                          ...globals,
                          devTools,
                        });

                        //update store
                        _updateGlobalConfiguration({
                          devTools,
                        });
                      }
                    )}
                  </div>
                </>
              )}
            </FormGroup>
          </div>
        )}
      </section> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(AppSettingsPanel);
