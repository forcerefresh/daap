import React, { useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectPanel.module.scss";
import {
  Button,
  Card,
  Checkbox,
  Colors,
  Elevation,
  FormGroup,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Text,
} from "@blueprintjs/core";
import {
  updateProjectSettings,
  updateSlideBreakpoints,
  updateSlideDuration,
} from "../../store/actions/actions";
import {
  getCheckboxField,
  getColorField,
  getNumericFiled,
  getUnitNumericFiled,
} from "../../inputs/input-utils";

import settingsCss from "../settings-panel/SettingsPanel.module.scss";
import { Breakpoint } from "./breakpoint-component/Breakpoint";
import { PREVIEW_SIZE } from "./breakpoint-preview/BreakpointPreview";
import { ISettings } from "../../store/reducers/i-settings";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "../../webslider-sdk/src/common/i-breakpoint-configuration";

enum ProjectPanelSections {
  Slider = "Slider",
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
  } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [ProjectPanelSections.Slider]: true,
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

  return (
    <div className={css.projectPanel}>
      <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Slider)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Slider]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Slider
        </div>
        {visibleSectionIds[ProjectPanelSections.Slider] && (
          <div className={settingsCss.panel}>
            <FormGroup>
              <div className="">
                {getUnitNumericFiled(
                  "Slide duration",
                  settings.slideDuration,
                  (value: string) => {
                    _updateSlideDuration(value);
                  },
                  undefined,
                  { style: { width: "100px" } },
                  ["ms", "s"]
                )}
              </div>
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
              className="bp3-form-helper-text"
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
                      breakpointConfiguration={conf}
                      pixelMultiplier={pixelMultiplier}
                      onChange={(newBreakpointConfiguration) => {
                        breakpointConfiguration.breakpointsConfiguration[idx] =
                          newBreakpointConfiguration;
                        _updateSlideBreakpoints(breakpointConfiguration);
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
});

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: string) => updateSlideDuration(newValue),
  _updateProjectSettings: (newValue: Partial<ISettings>) =>
    updateProjectSettings(newValue),
  _updateSlideBreakpoints: (slideBreakpoints: Breakpoints) =>
    updateSlideBreakpoints(slideBreakpoints),
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPanel);
