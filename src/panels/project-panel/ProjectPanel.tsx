import React, { useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectPanel.module.scss";
import {
  Button,
  Card,
  Checkbox,
  Elevation,
  FormGroup,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Text,
} from "@blueprintjs/core";
import {
  updateSlideBreakpoints,
  updateSlideDuration,
} from "../../store/actions/actions";
import { getNumericFiled } from "../../inputs/input-utils";

import settingsCss from "../settings-panel/SettingsPanel.module.scss";
import { Breakpoint } from "./breakpoint-component/Breakpoint";
import { PREVIEW_SIZE } from "./breakpoint-preview/BreakpointPreview";
import {
  BreakpointConfiguration,
  BreakpointsConfiguration,
} from "../../store/reducers/settings";

enum ProjectPanelSections {
  Main = "Main",
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
    slideDuration,
    breakpointConfiguration,
    _updateSlideDuration,
    _updateSlideBreakpoints,
  } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [ProjectPanelSections.Main]: true,
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
      PREVIEW_SIZE / item.normal.slide.width
    );
    pixelMultiplier = Math.min(
      pixelMultiplier,
      PREVIEW_SIZE / item.normal.slide.height
    );
  });

  console.log(pixelMultiplier);

  return (
    <div className={css.projectPanel}>
      <section>
        <div
          className={settingsCss.sectionHeader}
          onClick={() => toggleSection(ProjectPanelSections.Main)}
        >
          <Button
            minimal
            small={true}
            icon={
              visibleSectionIds[ProjectPanelSections.Main]
                ? "caret-down"
                : "caret-right"
            }
          ></Button>
          Main
        </div>
        {visibleSectionIds[ProjectPanelSections.Main] && (
          <div className={settingsCss.panel}>
            {/* helperText="Choose app layout which make app easier for use, improves
              performance, specificity specificity of the projects."
              label="Layout type"
              labelFor="layoutType" */}
            <FormGroup
            //requiredLabel={true}
            >
              <div className="input60">
                {getNumericFiled(
                  "Slide duration",
                  slideDuration,
                  (value: number) => {
                    _updateSlideDuration(value);
                  }
                )}
              </div>
            </FormGroup>
            {/*<FormGroup
              helperText="Helper text with details..."
              label="Show select list for slides"
              labelFor="layoutSlidesSelectionBox"
            >
              <Checkbox
                id="layoutSlidesSelectionBox"
                label="Enabled"
              />
            </FormGroup>*/}
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
              (conf, idx) => (
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
                        console.log(idx);
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
  slideDuration: state.project.settings.slideDuration,
  breakpointConfiguration: state.project.settings.breakpointsConfiguration,
});

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: number) => updateSlideDuration(newValue),
  _updateSlideBreakpoints: (slideBreakpoints: BreakpointsConfiguration) =>
    updateSlideBreakpoints(slideBreakpoints),
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPanel);
