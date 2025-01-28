import React, { useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectSettingsPanel.module.scss";
import { Button, Card, Colors, Elevation, FormGroup } from "@blueprintjs/core";
import {
  setDevice,
  updateProjectSettings,
  updateSlideBreakpoints,
  updateSlideDuration,
} from "../../store/actions/actions";
import {
  getCheckboxField,
  getColorField,
  getSelectField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";

import settingsCss from "../settings-panel/SettingsPanel.module.scss";
import { Breakpoint } from "./breakpoint-component/Breakpoint";
import { PREVIEW_SIZE } from "./breakpoint-preview/BreakpointPreview";
import { ISettings } from "../../store/reducers/i-settings";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IGlobalSlideOverlapTime } from "webslider-sdk/lib/common/i-slider-duration";

enum ProjectPanelSections {
  Project = "Project",
  Page = "Page",
  Preview = "Preview",
  Breakpoints = "Breakpoints",
}

/*interface IProjectPanelProps {
  onRequestClose: () => void;
}*/

export type IProjectPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>; /*&
  IProjectPanelProps;*/

const ProjectPanel: React.FC<IProjectPanelMergedProps> = (props) => {
  const {
    settings,
    breakpointConfiguration,
    _updateSlideDuration,
    _updateSlideBreakpoints,
    _updateProjectSettings,
    _setDevice,
    selectedDevice,
  } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [ProjectPanelSections.Project]: true,
    [ProjectPanelSections.Page]: true,
    [ProjectPanelSections.Preview]: true,
    [ProjectPanelSections.Breakpoints]: true,
  });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  let pixelMultiplier = 1;
  breakpointConfiguration.breakpointsConfiguration.forEach((item) => {
    pixelMultiplier = Math.min(
      pixelMultiplier,
      PREVIEW_SIZE / item.normal.page.width
    );
    pixelMultiplier = Math.min(
      pixelMultiplier,
      PREVIEW_SIZE / item.normal.maxSliderSize.width
    );
    pixelMultiplier = Math.min(
      pixelMultiplier,
      PREVIEW_SIZE / item.normal.maxSliderSize.height
    );
  });

  const enabledDevicesLength =
    breakpointConfiguration.breakpointsConfiguration.filter(
      (bp) => bp.enabled
    ).length;

  return (
    <div className={css.projectPanel}>
      <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Project)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Project]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Project
        </div>
        {visibleSectionIds[ProjectPanelSections.Project] && (
          <div className={settingsCss.panel}>
            <FormGroup>
              <div className="input60">
                {getColorField(
                  "Slider background color",
                  settings.sliderBackgroundColor,
                  (sliderBackgroundColor: any) => {
                    _updateProjectSettings({ sliderBackgroundColor });
                  },
                  ""
                )}
              </div>
              {getCheckboxField(
                "Auto play",
                settings.autoPlay,
                (autoPlay: boolean) => {
                  _updateProjectSettings({
                    autoPlay: autoPlay,
                  });
                },
                `If disabled start slide manually using "Object > Navigation > Page > Project "`,
                { style: { width: "100px" } }
              )}
              {getCheckboxField(
                "Hide outside content",
                !!settings.hideOutsideContent,
                (hideOutsideContent: boolean) => {
                  _updateProjectSettings({
                    hideOutsideContent: hideOutsideContent,
                  });
                },
                `Content outside the slider bounds will be hidden`,
                { style: { width: "100px" } }
              )}
            </FormGroup>
          </div>
        )}
      </section>

      <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Page)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Page]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Page
        </div>
        {visibleSectionIds[ProjectPanelSections.Page] && (
          <div className={settingsCss.panel}>
            <FormGroup>
              <div className="">
                {getUnitNumericFiled(
                  "Page/Slide duration",
                  settings.slideDuration,
                  (value: string) => {
                    _updateSlideDuration(value);
                  },
                  undefined,
                  { style: { width: "100px" } },
                  ["ms", "s"]
                )}
              </div>
              <div className="">
                {getUnitNumericFiled(
                  "Exit",
                  settings.exitSlideDuration,
                  (value: string) => {
                    _updateProjectSettings({ exitSlideDuration: value });
                  },
                  "Duration before end of page/slide when Out Animation starts. Example: Page/Slide: 10s; Exit: 2s; 10s - 2s= 8s. Out Animation starts at 8th second.",
                  { style: { width: "100px" } },
                  ["ms", "s"]
                )}
              </div>
              <div className="">
                {getCheckboxField(
                  "First slide animation skip",
                  settings.skipFirstSlideAnimation,
                  (skipFirstSlideAnimation: boolean) => {
                    _updateProjectSettings({
                      skipFirstSlideAnimation: skipFirstSlideAnimation,
                    });
                  },
                  "Skip slide animation when first slide start for the first time.",
                  { style: { width: "100px" } }
                )}
              </div>
              <div className="">
                {getSelectField(
                  "Breakpoints reference",
                  settings.breakpointReference,
                  [
                    { label: "Viewport", value: "viewport" },
                    { label: "Parent element", value: "parent" },
                  ],
                  (breakpointReference) => {
                    _updateProjectSettings({ breakpointReference });
                  }
                )}
              </div>
            </FormGroup>
          </div>
        )}
      </section>

      <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Preview)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Preview]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Preview
        </div>
        {visibleSectionIds[ProjectPanelSections.Preview] && (
          <div className={settingsCss.panel}>
            <div
              style={{ marginBottom: "15px", color: Colors.ORANGE5 }}
              className="bp5-form-helper-text"
            >
              Preview configuration are only used for preview inside app. They
              are not aplied to slider configuration.
            </div>
            <FormGroup>
              <div className="input60">
                {getColorField(
                  "Page background color",
                  settings.pageBackgroundColor,
                  (pageBackgroundColor: any) => {
                    _updateProjectSettings({ pageBackgroundColor });
                  },

                  "" //"NOTE: Page color is use used only for preview in the app"
                )}
              </div>

              <div className="input60">
                {getColorField(
                  "Layout box color",
                  settings.layoutBoxBackgroundColor,
                  (layoutBoxBackgroundColor: any) => {
                    _updateProjectSettings({ layoutBoxBackgroundColor });
                  },

                  ""
                )}
              </div>

              <div className="input60">
                {getCheckboxField(
                  "Transparent header",
                  settings.transparentHeader,
                  (transparentHeader: any) => {
                    _updateProjectSettings({ transparentHeader });
                  },
                  ""
                )}
              </div>
            </FormGroup>
          </div>
        )}
      </section>

      <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Breakpoints)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Breakpoints]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Responsive configuration
        </div>
        {visibleSectionIds[ProjectPanelSections.Breakpoints] && (
          <div className={settingsCss.panel}>
            {breakpointConfiguration.breakpointsConfiguration.map(
              (conf: any, idx: number) => (
                <div>
                  <Card
                    interactive={false}
                    elevation={Elevation.TWO}
                    className={cx(css.card, css.breakpointHolder)}
                  >
                    <Breakpoint
                      disableEnableToBeDisabled={enabledDevicesLength === 1}
                      breakpointConfiguration={conf}
                      pixelMultiplier={pixelMultiplier}
                      onChange={(newBreakpointConfiguration) => {
                        breakpointConfiguration.breakpointsConfiguration[idx] =
                          newBreakpointConfiguration;
                        _updateSlideBreakpoints(breakpointConfiguration);

                        //NOTE if we disable currently selected device
                        if (
                          newBreakpointConfiguration.type === selectedDevice &&
                          !newBreakpointConfiguration.enabled
                        ) {
                          const newSelectedDevice =
                            breakpointConfiguration.breakpointsConfiguration.find(
                              (bp) => bp.enabled
                            )?.type ?? _setDevice(newSelectedDevice);
                        }
                      }}
                    />
                  </Card>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  settings: state.project.settings,
  breakpointConfiguration: state.project.settings.breakpoints,
  selectedDevice: state.stage.selectedDevice,
});

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: string) => updateSlideDuration(newValue),
  _updateProjectSettings: (newValue: Partial<ISettings>) =>
    updateProjectSettings(newValue),
  _updateSlideBreakpoints: (slideBreakpoints: Breakpoints) =>
    updateSlideBreakpoints(slideBreakpoints),
  _setDevice: setDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPanel);
