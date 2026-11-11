import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AppSettingsPanel.module.scss";
import { Button, FormGroup, HTMLSelect } from "@blueprintjs/core";
import { updateGlobalConfiguration } from "../../store/actions/actions";
import {
  getCheckboxField,
  getColorField,
  getSelectField,
} from "../../inputs/input-utils";

import { IAppSettings } from "../../store/reducers/globals";
import { IntegrationContext } from "../../integration";
import { SectionHeader } from "../common/section-header/SectionHeader";

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
  const { platform } = globalContext;

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
        <SectionHeader
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
        </SectionHeader>
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
                },
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
                { disabled: !globals.snapToObject },
              )}
            </div>

            <div className="input60">
              {getCheckboxField(
                "Snap to margin",
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
                },
              )}
            </div>

            <div className="input60">
              {getSelectField(
                "Snap to margin threshold",
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
                    snapToMarginThreshold: snapToMarginThreshold,
                  });
                },
                { disabled: !globals.snapToMargin },
              )}
            </div>

            <div className="input60">
              {getCheckboxField(
                "Snap to document",
                globals.snapToDocument,
                (snapToDocument: any) => {
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      snapToDocument,
                    },
                  });

                  //update store
                  _updateGlobalConfiguration({
                    snapToDocument,
                  });
                },
              )}
            </div>

            <div className="input60">
              {getSelectField(
                "Snap to document threshold",
                globals.snapToDocumentThreshold,
                Array(10)
                  .fill({})
                  .map((_, idx) => ({
                    value: idx + 1,
                    label: idx + 1 + "px",
                  })),
                (snapToDocumentThreshold) => {
                  // save settings
                  patchSettings({
                    appSettings: {
                      ...globals,
                      snapToDocumentThreshold,
                    },
                  });

                  //update store
                  _updateGlobalConfiguration({
                    snapToDocumentThreshold,
                  });
                },
                { disabled: !globals.snapToDocument },
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
                "",
              )}
            </div>

          </div>
        )}
      </section>

      <section>
        <SectionHeader
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
        </SectionHeader>
        {visibleSectionIds[GlobalPanelSections.OtherSettings] && (
          <div className={css.panel}>
            {platform.hasWpHomePage && (
              <FormGroup label="Home page" labelFor="homePage">
                <HTMLSelect
                  name="homePage"
                  value={`${globals.homePage}`}
                  options={[
                    { value: "search", label: "Search" },
                    { value: "editor", label: "Editor" },
                    { value: "", label: "Intro (reset only)" },
                  ]}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    const homePage = event.currentTarget.value;
                    // save settings
                    patchSettings({
                      appSettings: {
                        ...globals,
                        homePage: homePage,
                      },
                    });

                    //update store
                    _updateGlobalConfiguration({
                      homePage: homePage,
                    });
                  }}
                ></HTMLSelect>
              </FormGroup>
            )}

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

          </div>
        )}
      </section>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  globals: state.globals,
});

const mapDispatchToProps = {
  _updateGlobalConfiguration: (globals: Partial<IAppSettings>) =>
    updateGlobalConfiguration(globals),
};

export default connect(mapStateToProps, mapDispatchToProps)(AppSettingsPanel);
